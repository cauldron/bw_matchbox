import json
import math
import os
import random
import string
import uuid
from pathlib import Path

import bw2data as bd
import flask
import tomli
from bw2data.backends import ActivityDataset as AD
from flask_httpauth import HTTPBasicAuth
from peewee import fn
from werkzeug.security import check_password_hash, generate_password_hash

from .utils import name_close_enough, similar_location

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

matchbox_app = flask.Flask(
    "matchbox_app",
    static_folder=BASE_DIR / "assets",
    template_folder=BASE_DIR / "assets" / "templates",
)
matchbox_app.config["SECRET_KEY"] = os.urandom(24)

auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(username, password):
    users = matchbox_app.config["mb_users"]
    if username in users and check_password_hash(users.get(username), password):
        return username


def configure_app(filepath, app):
    try:
        config_fp = Path(filepath)
        assert config_fp.exists
        with open(config_fp, "rb") as f:
            config = tomli.load(f)
        assert "users" in config
    except:
        # NOTE: If you got this exception, make sure first you don't have
        # windows-style backslahes in your config file for file names (no
        # double `\\`).
        raise ValueError("Invalid or unreadable config file")

    app.config["mb_users"] = {
        user: generate_password_hash(password)
        for user, password in config["users"].items()
    }
    app.config["mb_output_dir"] = Path(config["files"]["output_dir"])
    if not (app.config["mb_output_dir"].is_dir() and os.access(app.config["mb_output_dir"], os.W_OK)):
        raise ValueError("`output_dir` is invalid")

    return app


def get_context():
    project = flask.request.cookies.get("project")
    if not project:
        return flask.redirect(flask.url_for("select_project"))
    source = flask.request.cookies.get("source")
    target = flask.request.cookies.get("target")
    if not (source and target):
        return flask.redirect(flask.url_for("select_databases"))
    proxy = flask.request.cookies.get("proxy")
    return project, source, target, proxy


def get_files():
    files = flask.request.cookies.get("files")
    if files:
        files = json.loads(files)
    else:
        included = filter(lambda x: x.suffix.lower() == ".json", DATA_DIR.iterdir())
        files = [
            {
                "index": str(index),
                "filename": path.name,
                "dirpath": str(path.parent),
                "writable": os.access(path, os.W_OK),
                "enabled": True,
            }
            for index, path in enumerate(included)
        ]
    return files


@matchbox_app.route("/project", methods=["POST", "GET"])
@auth.login_required
def select_project():
    files = get_files()

    if flask.request.method == "POST":
        project = flask.request.form["project"]
        resp = flask.make_response(flask.redirect(flask.url_for("select_databases")))
        resp.set_cookie("project", project)
        return resp
    else:
        resp = flask.make_response(
            flask.render_template(
                "project.html",
                file_number=sum(1 for obj in files if obj["enabled"]),
                projects=[o for o in bd.projects],
                user=auth.current_user(),
            )
        )
        resp.delete_cookie("project")
        resp.delete_cookie("source")
        resp.delete_cookie("target")
        return resp


@matchbox_app.route("/databases", methods=["POST", "GET"])
@auth.login_required
def select_databases():
    project = flask.request.cookies.get("project")
    if not project:
        return flask.redirect(flask.url_for("select_project"))
    bd.projects.set_current(project)

    files = get_files()

    if flask.request.method == "POST":
        source = flask.request.form["source"]
        target = flask.request.form["target"]
        proxy_existing = flask.request.form["proxy-existing"]
        proxy_new = flask.request.form["proxy-new"].strip()

        if source != target:
            resp = flask.make_response(flask.redirect(flask.url_for("index")))
            resp.set_cookie("source", source)
            resp.set_cookie("target", target)

            if proxy_new:
                bd.Database(proxy_new).register()
                resp.set_cookie("proxy", proxy_new)
            else:
                resp.set_cookie("proxy", proxy_existing)

            return resp

    resp = flask.make_response(
        flask.render_template(
            "databases.html",
            project=project,
            file_number=sum(1 for obj in files if obj["enabled"]),
            user=auth.current_user(),
            databases=bd.databases,
        )
    )
    resp.delete_cookie("source")
    resp.delete_cookie("target")
    return resp


@matchbox_app.route("/files", methods=["POST", "GET"])
@auth.login_required
def select_matching_files():
    context = get_context()
    if isinstance(context, flask.Response):
        proj, s, t, proxy = None, None, None, None
    else:
        proj, s, t, proxy = context

    files = get_files()

    if flask.request.method == "POST":
        # Don't get unchecked elements in forms
        for line in files:
            line["enabled"] = False

        for key, value in flask.request.form.items():
            index = key.replace("enabled-", "")
            for line in files:
                if line["index"] == index:
                    line["enabled"] = value == "on"

            resp = flask.make_response(flask.redirect(flask.url_for("index")))
            resp.set_cookie("files", json.dumps(files))
            return resp

    # Format file cookie data for nicer form
    files_formatted = [
        sorted(
            [obj for obj in files if obj["dirpath"] == dirpath],
            key=lambda x: x["filename"],
        )
        for dirpath in sorted({obj["dirpath"] for obj in files})
    ]

    resp = flask.make_response(
        flask.render_template(
            "select_files.html",
            files=files_formatted,
            file_number=sum(1 for obj in files if obj["enabled"]),
            project=proj,
            proxy=proxy,
            source=s,
            target=t,
            user=auth.current_user(),
        )
    )
    resp.set_cookie("files", json.dumps(files))
    return resp


@matchbox_app.route("/", methods=["GET"])
@auth.login_required
def index():
    context = get_context()
    if isinstance(context, flask.Response):
        return context
    proj, s, t, proxy = context

    files = get_files()

    bd.projects.set_current(proj)
    return flask.render_template(
        "index.html",
        title="bw_matchbox Index Page",
        unmatched_link=True,
        project=proj,
        source=s,
        target=t,
        file_number=sum(1 for obj in files if obj["enabled"]),
        table_data=[obj for obj, _ in zip(bd.Database(s), range(50))],
        query_string="",
        database=s,
        proxy=proxy,
        user=auth.current_user(),
    )


@matchbox_app.route("/processes", methods=["GET"])
@auth.login_required
def processes():
    """API Endpoint to get process data for dynamic table population.

    GET args:

    * database (str): Name of database to draw processes from. Defaults to source
                      database (stored in cookie) if not given.
    * limit (int): Number of results to return
    * order_by (str, optional): Parameter to sort by. Random if not provided. Valid parameters:
        * name (will be used 99% of the time)
        * location
        * product (short name for reference product)
    * offset (int, optional): Offset from beginning of sorted values. Zero-indexed.
                    Only used if sorting.
    * filter (string, optional): Optional attribute filter. Should be one of `matched`, `unmatched`, or `waitlist`.

    Response data format (JSON):

    ```
        [
            {
                'details_url': 'URL for `process_detail` page for this activity',
                'match_url': 'URL for `match` page for this activity',
                'matched': 'Boolean. Whether or not process is already matched.',
                'waitlist': 'Boolean. Whether or not process has attribute `waitlist`.',
                'id': 'Integer process ID',
                'name': 'Process name',
                'location': 'Process location',
                'unit': 'Unit of reference product',
            }
        ]
    ```
    """
    context = get_context()
    proj, s, t, proxy = context
    bd.projects.set_current(proj)

    database_label = flask.request.args.get("database") or s
    qs = AD.select().where(AD.database == database_label)

    order_by = flask.request.args.get("order_by")
    if order_by and order_by in ("name", "location", "product"):
        qs = qs.order_by(getattr(AD, order_by))
    else:
        qs = qs.order_by(fn.Random())

    offset = int(flask.request.args.get("offset"))
    limit = int(flask.request.args.get("limit"))

    filter_arg = flask.request.args.get("filter")
    if filter_arg is None:
        total_records = qs.count()

        if offset:
            qs = qs.offset(int(offset))
        if limit:
            qs = qs.limit(int(limit))
        else:
            qs = qs.limit(50)
    else:
        if filter_arg == "unmatched":
            qs = [node for node in qs if not node.data.get('matched')]
        else:
            qs = [node for node in qs if node.data.get(filter_arg)]

        total_records = len(qs)

        if offset:
            qs = qs[offset:]
        if limit:
            qs = qs[:limit]
        else:
            qs = qs[:50]

    payload = {
        "total_records": total_records,
        "data": [
            {
                "details_url": flask.url_for("process_detail", id=obj.id),
                "match_url": flask.url_for("match", source=obj.id),
                "matched": bool(obj.data.get("matched")),
                "waitlist": bool(obj.data.get("waitlist")),
                "id": obj.id,
                "name": obj.name,
                "location": obj.location,
                "unit": obj.data["unit"],
            }
            for obj in qs
        ],
    }
    return flask.jsonify(payload)


# @matchbox_app.route("/match-status", methods=["GET"])
# @auth.login_required
# def match_status():
#     crud = {}
#     status = {}
#     failed = []

#     for filename in filter(lambda x: x.suffix.lower() == ".json", DATA_DIR.iterdir()):
#         try:
#             file_status = {'count': 0, 'duplicates': []}
#             data = json.load(open(filename))
#             for key in OPERATIONS:
#                 for elem in data.get(key, []):
#                     lookup = frozendict(elem['source'])
#                     value = frozendict(elem['target'])
#                     file_status['count'] += 1
#                     if lookup in crud and crud.get(lookup) != value:
#                         error = "Source: {}. Already have: {}. Given: {}".format(
#                            dict(lookup), dict(crud[lookup]), dict(value))
#                         if error not in file_status['duplicates']:
#                             file_status['duplicates'].append(error)
#                     else:
#                         crud[lookup] = value
#             status[filename.name] = file_status
#         except:
#             failed.append(filename.name)
#             raise
#     return flask.render_template(
#         "match-status.html",
#         failed=failed,
#         status=[(key, value) for key, value in status.items()]
#    )


@matchbox_app.route("/search/", methods=["GET"])
@auth.login_required
def search():
    context = get_context()
    if isinstance(context, flask.Response):
        return context
    proj, s, t, proxy = context

    files = get_files()
    bd.projects.set_current(proj)

    q = flask.request.args.get("q")
    embed = flask.request.args.get("e")
    if embed:
        source = bd.get_activity(id=int(flask.request.args.get("source")))
        return flask.render_template(
            "search-embedded.html",
            source=source,
            table_data=bd.Database(t).search(q, limit=100),
        )
    else:
        search_db = flask.request.args.get("database")
        return flask.render_template(
            "index.html",
            project=proj,
            source=s,
            target=t,
            file_number=sum(1 for obj in files if obj["enabled"]),
            proxy=proxy,
            user=auth.current_user(),
            title="bw_matchbox Search Result",
            table_data=bd.Database(search_db).search(q, limit=100),
            query_string=q,
            database=s,
        )


@matchbox_app.route("/add-attribute/<id>", methods=["GET"])
@auth.login_required
def add_attribute(id):
    context = get_context()
    proj, s, t, proxy = context
    bd.projects.set_current(proj)
    node = bd.get_node(id=id)

    attr = flask.request.args.get("attr")
    value = flask.request.args.get("value")

    if attr is None or value is None:
        flask.abort(400)
    if attr in ("highlighted", "matched", "no_match_needed"):
        if value not in ("0", "1"):
            flask.abort(400)
        value = {"0": False, "1": True}[value]

    node[attr] = value
    node.save()
    return ""


@matchbox_app.route("/process/<id>", methods=["GET"])
@auth.login_required
def process_detail(id):
    context = get_context()
    if isinstance(context, flask.Response):
        return context
    proj, s, t, proxy = context
    files = get_files()
    bd.projects.set_current(proj)

    node = bd.get_node(id=id)
    proxy_node = bd.get_node(id=node['proxy_id']) if node.get('proxy_id') else None

    same_name = AD.select().where(
        AD.name == node["name"], AD.database == node["database"], AD.id != node.id
    )
    same_name_count = same_name.count()
    technosphere = sorted(node.technosphere(), key=lambda x: x.input["name"])
    biosphere = sorted(node.biosphere(), key=lambda x: x.input["name"])

    return flask.render_template(
        "process_detail.html",
        title="bw_matchbox Detail Page",
        ds=node,
        authors=",".join([obj.get('name', 'Unknown') for obj in node.get('authors', [])]),
        project=proj,
        proxy=proxy,
        proxy_node=proxy_node,
        source=s,
        target=t,
        file_number=sum(1 for obj in files if obj["enabled"]),
        user=auth.current_user(),
        same_name_count=same_name_count,
        same_name=same_name,
        technosphere=technosphere,
        biosphere=biosphere,
        show_matching=False,
    )


@matchbox_app.route("/multi-match/<id>", methods=["GET"])
@auth.login_required
def multi_match(id):
    context = get_context()
    proj, s, t, proxy = context
    bd.projects.set_current(proj)

    node = bd.get_node(id=id)
    node['matched'] = True
    node['no_match_needed'] = True
    node.save()

    for ds in AD.select().where(
        AD.name == node["name"], AD.database == node["database"], AD.id != node.id
    ):
        if not ds.data.get('matched'):
            ds.data['matched'] = True
            ds.data['no_match_needed'] = True
            ds.save()
    return ""


@matchbox_app.route("/match/<source>", methods=["GET"])
@auth.login_required
def match(source):
    context = get_context()
    if isinstance(context, flask.Response):
        return context
    proj, s, t, proxy = context
    files = get_files()
    bd.projects.set_current(proj)

    node = bd.get_node(id=source)

    matches = bd.Database(t).search(node["name"] + " " + node.get("location", ""))

    return flask.render_template(
        "match.html",
        title="Database Matching Page",
        ds=node,
        project=proj,
        proxy=proxy,
        source=s,
        target=t,
        file_number=sum(1 for obj in files if obj["enabled"]),
        user=auth.current_user(),
        query_string=node["name"] + " " + node.get("location", ""),
        matches=matches,
    )


def check_similar(node, candidates):
    for index, candidate in enumerate(candidates):
        if node.get("collapsed") or candidate.get("collapsed"):
            continue
        if (
            name_close_enough(node["name"], candidate["name"])
            and similar_location(node["location"], candidate["location"])
            and node["unit"] == candidate["unit"]
            and math.isclose(
                node["amount"], candidate["amount"], rel_tol=0.025, abs_tol=1e-6
            )
        ):
            node["collapsed"] = candidate["collapsed"] = True
            node["collapsed-group"] = candidate[
                "collapsed-group"
            ] = "Collapsed-{}-{}".format(
                index, "".join(random.choices(string.ascii_letters, k=6))
            )


@matchbox_app.route("/compare/<source>/<target>", methods=["GET"])
@auth.login_required
def compare(source, target):
    context = get_context()
    if isinstance(context, flask.Response):
        return context
    proj, s, t, proxy = context

    files = get_files()
    bd.projects.set_current(proj)

    source = bd.get_node(id=int(source))
    target = bd.get_node(id=int(target))

    source_technosphere = [
        {
            "amount": exc["amount"],
            "amount_display": "{:0.2g}".format(exc["amount"]),
            "name": exc.input["name"],
            "unit": exc.input["unit"],
            "location": exc.input["location"],
            "input_id": exc.input.id,
            "url": flask.url_for("process_detail", id=exc.input.id),
        }
        for exc in source.technosphere()
    ]
    target_itself = {
        "amount": 1,
        "amount_display": "1.0",
        "name": target["name"],
        "unit": target["unit"],
        "location": target.get("location", ""),
        "input_id": target.id,
        "url": flask.url_for("process_detail", id=target.id),
    }
    target_technosphere = [
        {
            "amount": exc["amount"],
            "amount_display": "{:0.2g}".format(exc["amount"]),
            "name": exc.input["name"],
            "unit": exc.input["unit"],
            "location": exc.input["location"],
            "input_id": exc.input.id,
            "url": flask.url_for("process_detail", id=exc.input.id),
        }
        for exc in target.technosphere()
    ]

    for obj in target_technosphere:
        # Modifies in place
        check_similar(obj, source_technosphere)

    return flask.render_template(
        "compare.html",
        title="Database Comparison Page",
        project=proj,
        proxy=proxy,
        source=s,
        target=t,
        target_json=json.dumps(target_itself),
        user=auth.current_user(),
        file_number=sum(1 for obj in files if obj["enabled"]),
        source_node=source,
        source_data_json=json.dumps(source_technosphere),
        target_node=target,
        target_data_json=json.dumps(target_technosphere),
    )


@matchbox_app.route("/expand/<id>/<scale>/", methods=["GET"])
@auth.login_required
def expand(id, scale):
    context = get_context()
    if isinstance(context, flask.Response):
        return context
    proj, s, t, proxy = context

    bd.projects.set_current(proj)
    node = bd.get_activity(id=int(id))
    scale = float(scale)

    exchanges = list(node.technosphere())
    for exc in exchanges:
        exc["amount"] *= scale

    payload = [
        {
            "amount": exc["amount"],
            "amount_display": "{:0.2g}".format(exc["amount"]),
            "name": exc.input["name"],
            "unit": exc.input["unit"],
            "location": exc.input["location"],
            "input_id": exc.input.id,
            "url": flask.url_for("process_detail", id=exc.input.id),
        }
        for exc in exchanges
    ]
    return flask.jsonify(payload)


@matchbox_app.route("/create-proxy/", methods=["POST"])
@auth.login_required
def create_proxy():
    content = flask.request.get_json()
    proj, s, t, proxy = get_context()
    # files = get_files()
    bd.projects.set_current(proj)

    source = bd.get_activity(id=content["source"])
    process = bd.Database(proxy).new_activity(
        name=content["name"],
        code=uuid.uuid4().hex,
        comment=content["comment"],
        unit=source["unit"],
        location=source["location"],
        original_name=source["name"],
        original_id=source.id,
        **{"reference product": source.get("reference product")}
    )
    process.save()

    source_rp = source.rp_exchange()
    process.new_edge(
        input=process, amount=source_rp["amount"], type="production"
    ).save()
    for exc in content["exchanges"]:
        process.new_edge(
            type="technosphere",
            input=bd.get_activity(id=exc["input_id"]),
            amount=exc["amount"],
        ).save()

    source["matched"] = True
    source['proxy_id'] = process.id
    source.save()

    return flask.redirect(flask.url_for("process_detail", id=process.id))
