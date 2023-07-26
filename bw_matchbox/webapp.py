from bw2data.backends import ActivityDataset as AD
from flask_httpauth import HTTPBasicAuth
from pathlib import Path
from werkzeug.security import check_password_hash, generate_password_hash
import bw2data as bd
import flask
import json
import os
import uuid
import tomli


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

matchbox_app = flask.Flask(
    "matchbox_app",
    static_folder=BASE_DIR / "assets",
    template_folder=BASE_DIR / "assets" / "templates"
)
matchbox_app.config["SECRET_KEY"] = os.urandom(24)

auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(username, password):
    users = matchbox_app.config['mb_users']
    if username in users and check_password_hash(users.get(username), password):
        return username


def configure_app(filepath, app):
    try:
        config_fp = Path(filepath)
        assert config_fp.exists
        with open(config_fp, "rb") as f:
            config = tomli.load(f)
        assert 'users' in config
    except:
        raise ValueError("Invalid or unreadable config file")

    app.config["mb_users"] = {
        user: generate_password_hash(password)
        for user, password in config['users'].items()
    }
    app.config["mb_changes_file"] = config['files']['changes_file']
    try:
        json.load(open(app.config["mb_changes_file"], "rb"))
    except:
        raise ValueError("Can't read changes file")
    return app


def get_context():
    project = flask.request.cookies.get('project')
    if not project:
        return flask.redirect(flask.url_for("select_project"))
    source = flask.request.cookies.get('source')
    target = flask.request.cookies.get('target')
    if not (source and target):
        return flask.redirect(flask.url_for("select_databases"))
    proxy = flask.request.cookies.get('proxy')
    return project, source, target, proxy


def get_files():
    files = flask.request.cookies.get('files')
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


@matchbox_app.route('/project', methods = ['POST', 'GET'])
@auth.login_required
def select_project():
    files = get_files()

    if flask.request.method == 'POST':
        project = flask.request.form['project']
        resp = flask.make_response(flask.redirect(flask.url_for("select_databases")))
        resp.set_cookie('project', project)
        return resp
    else:
        resp = flask.make_response(flask.render_template(
            "project.html",
            file_number=sum(1 for obj in files if obj['enabled']),
            projects=[o for o in bd.projects],
            user=auth.current_user(),
            changes_file=Path(matchbox_app.config["mb_changes_file"]).name,
        ))
        resp.delete_cookie("project")
        resp.delete_cookie("source")
        resp.delete_cookie("target")
        return resp


@matchbox_app.route('/databases', methods = ['POST', 'GET'])
@auth.login_required
def select_databases():
    project = flask.request.cookies.get('project')
    if not project:
        return flask.redirect(flask.url_for("select_project"))
    bd.projects.set_current(project)

    files = get_files()

    if flask.request.method == 'POST':
        source = flask.request.form['source']
        target = flask.request.form['target']
        use_proxy = 'use-proxy' in flask.request.form
        proxy_existing = flask.request.form['proxy-existing']
        proxy_new = flask.request.form['proxy-new'].strip()
        if source != target:
            resp = flask.make_response(flask.redirect(flask.url_for("index")))
            resp.set_cookie('source', source)
            resp.set_cookie('target', target)

            if use_proxy:
                if proxy_new:
                    bd.Database(proxy_new).register()
                    resp.set_cookie('proxy', proxy_new)
                else:
                    resp.set_cookie('proxy', proxy_existing)
            else:
                resp.set_cookie('proxy', "")

            return resp

    resp = flask.make_response(flask.render_template(
        "databases.html",
        project=project,
        file_number=sum(1 for obj in files if obj['enabled']),
        user=auth.current_user(),
        changes_file=Path(matchbox_app.config["mb_changes_file"]).name,
        databases=bd.databases,
    ))
    resp.delete_cookie("source")
    resp.delete_cookie("target")
    return resp


@matchbox_app.route('/files', methods = ['POST', 'GET'])
@auth.login_required
def select_matching_files():
    context = get_context()
    if isinstance(context, flask.Response):
        proj, s, t, proxy = None, None, None, None
    else:
        proj, s, t, proxy = context

    files = get_files()

    if flask.request.method == 'POST':
        # Don't get unchecked elements in forms
        for line in files:
            line['enabled'] = False

        for key, value in flask.request.form.items():
            index = key.replace("enabled-", "")
            for line in files:
                if line['index'] == index:
                    line['enabled'] = value == "on"

            resp = flask.make_response(flask.redirect(flask.url_for("index")))
            resp.set_cookie('files', json.dumps(files))
            return resp

    # Format file cookie data for nicer form
    files_formatted = [
        sorted([obj for obj in files if obj['dirpath'] == dirpath], key=lambda x: x['filename'])
        for dirpath in sorted({obj['dirpath'] for obj in files})
    ]

    resp = flask.make_response(flask.render_template(
        "select_files.html",
        files=files_formatted,
        file_number=sum(1 for obj in files if obj['enabled']),
        project=proj,
        proxy=proxy,
        source=s,
        target=t,
        user=auth.current_user(),
        changes_file=Path(matchbox_app.config["mb_changes_file"]).name,
    ))
    resp.set_cookie('files', json.dumps(files))
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
        file_number=sum(1 for obj in files if obj['enabled']),
        table_data=[obj for obj, _ in zip(bd.Database(s), range(50))],
        query_string="",
        database=s,
        proxy=proxy,
        user=auth.current_user(),
        changes_file=Path(matchbox_app.config["mb_changes_file"]).name,
    )


@matchbox_app.route("/unmatched", methods=["GET"])
@auth.login_required
def unmatched():
    context = get_context()
    if isinstance(context, flask.Response):
        return context
    proj, s, t, proxy = context

    files = get_files()

    bd.projects.set_current(proj)
    return flask.render_template(
        "index.html",
        title="Unmatched Processes",
        unmatched_link=False,
        project=proj,
        proxy=proxy,
        source=s,
        target=t,
        file_number=sum(1 for obj in files if obj['enabled']),
        table_data=[obj for obj, _ in zip(bd.Database(s), range(50))],
        query_string="",
        database=s,
        user=auth.current_user(),
        changes_file=Path(matchbox_app.config["mb_changes_file"]).name,
    )


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
#                         error = "Source: {}. Already have: {}. Given: {}".format(dict(lookup), dict(crud[lookup]), dict(value))
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
            file_number=sum(1 for obj in files if obj['enabled']),
            proxy=proxy,
            user=auth.current_user(),
            title="bw_matchbox Search Result",
            table_data=bd.Database(search_db).search(q, limit=100),
            query_string=q,
            database=s,
        )


@matchbox_app.route("/mark-matched/<id>", methods=["GET"])
@auth.login_required
def mark_matched(id):
    context = get_context()
    proj, s, t, proxy = context
    bd.projects.set_current(proj)
    node = bd.get_node(id=id)
    node['matched'] = True
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
    same_name = AD.select().where(AD.name == node['name'], AD.database == node['database'], AD.id != node.id)
    same_name_count = same_name.count()
    technosphere = sorted(node.technosphere(), key=lambda x: x.input['name'])
    biosphere = sorted(node.biosphere(), key=lambda x: x.input['name'])

    return flask.render_template(
        "process_detail.html",
        title="bw_matchbox Detail Page",
        ds=node,
        project=proj,
        proxy=proxy,
        source=s,
        target=t,
        file_number=sum(1 for obj in files if obj['enabled']),
        user=auth.current_user(),
        changes_file=Path(matchbox_app.config["mb_changes_file"]).name,
        same_name_count=same_name_count,
        same_name=same_name,
        technosphere=technosphere,
        biosphere=biosphere,
        show_matching=False,
    )


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

    matches = bd.Database(t).search(node['name'] + " " + node.get('location', ''))

    return flask.render_template(
        "match.html",
        title="Database Matching Page",
        ds=node,
        project=proj,
        proxy=proxy,
        source=s,
        target=t,
        file_number=sum(1 for obj in files if obj['enabled']),
        user=auth.current_user(),
        changes_file=Path(matchbox_app.config["mb_changes_file"]).name,
        query_string=node['name'] + " " + node.get('location', ''),
        matches=matches
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
            'amount': exc['amount'],
            'amount_display': '{:0.2g}'.format(exc['amount']),
            'name': exc.input['name'],
            'unit': exc.input['unit'],
            'location': exc.input['location'],
            'input_id': exc.input.id,
            'url': flask.url_for("process_detail", id=exc.input.id),
        }
        for exc in source.technosphere()
    ]
    target_itself = {
        'amount': 1,
        'amount_display': "1.0",
        'name': target['name'],
        'unit': target['unit'],
        'location': target.get('location', ''),
        'input_id': target.id,
        'url': flask.url_for("process_detail", id=target.id),
    }
    target_technosphere = [
        {
            'amount': exc['amount'],
            'amount_display': '{:0.2g}'.format(exc['amount']),
            'name': exc.input['name'],
            'unit': exc.input['unit'],
            'location': exc.input['location'],
            'input_id': exc.input.id,
            'url': flask.url_for("process_detail", id=exc.input.id),
        }
        for exc in target.technosphere()
    ]

    return flask.render_template(
        "compare.html",
        title="Database Comparison Page",
        project=proj,
        proxy=proxy,
        source=s,
        target=t,
        target_json=json.dumps(target_itself),
        user=auth.current_user(),
        changes_file=Path(matchbox_app.config["mb_changes_file"]).name,
        file_number=sum(1 for obj in files if obj['enabled']),
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
        exc['amount'] *= scale

    payload = [
        {
            'amount': exc['amount'],
            'amount_display': '{:0.2g}'.format(exc['amount']),
            'name': exc.input['name'],
            'unit': exc.input['unit'],
            'location': exc.input['location'],
            'input_id': exc.input.id,
            'url': flask.url_for("process_detail", id=exc.input.id),
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

    source = bd.get_activity(id=content['source'])
    process = bd.Database(proxy).new_activity(
        name=content['name'],
        code=uuid.uuid4().hex,
        comment=content['comment'],
        unit=source['unit'],
        location=source['location'],
        original_name=source['name'],
        original_id=source.id,
        **{'reference product': source.get('reference product')}
    )
    process.save()

    source_rp = source.rp_exchange()
    process.new_edge(input=process, amount=source_rp['amount'], type="production").save()
    for exc in content['exchanges']:
        process.new_edge(
            type="technosphere",
            input=bd.get_activity(id=exc['input_id']),
            amount=exc['amount'],
        ).save()

    source['matched'] = True
    source.save()

    return flask.redirect(flask.url_for("process_detail", id=process.id))
