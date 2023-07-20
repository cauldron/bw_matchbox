# from . import (
#     base_dir,
#     export_dir,
#     File,
#     search_corrector_gs1,
#     search_corrector_naics,
#     search_corrector_useeio,
#     search_gs1,
#     search_gs1_disjoint,
#     search_naics,
#     search_naics_disjoint,
#     search_useeio,
#     search_useeio_disjoint,
# )
# from .ingestion import mapping
# from .semantic_web import write_matching_to_rdf
# from .export_generic import write_matching_to_csv_dataframe
import flask
import json
from frozendict import frozendict
from collections import defaultdict
# from flask import (
#     abort,
#     flash,
#     Flask,
#     redirect,
#     render_template,
#     request,
#     Response,
#     send_file,
#     url_for,
#     jsonify,
#     json,
#     g,
# )
import bw2data as bd
import bw2io as bi
from bw2data.backends import ActivityDataset as AD
# import hashlib
from pathlib import Path
from peewee import DoesNotExist
from thefuzz import process
# from werkzeug.utils import secure_filename
import os
from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

dare_app = flask.Flask(
    "dare_app",
    static_folder=BASE_DIR / "assets",
    template_folder=BASE_DIR / "assets" / "templates"
)
auth = HTTPBasicAuth()


users = {
    "pierryves": generate_password_hash("foen2023"),
    "chris": generate_password_hash("d84bnduc74ngidnf")
}


@auth.verify_password
def verify_password(username, password):
    if username in users and check_password_hash(users.get(username), password):
        return username

# UPLOAD_FOLDER = base_dir / "uploads"
# UPLOAD_FOLDER.mkdir(exist_ok=True)
# ALLOWED_EXTENSIONS = {
#     # "xml",
#     # "spold",
#     "csv",
#     "xlsx",
#     "xls",
#     "zip",
# }

# Default limit for file uploads is 5 MB
# dare_app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024
# dare_app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Generate a secret key for the session, otherwise flash() returns an exception
dare_app.config["SECRET_KEY"] = os.urandom(24)


# def allowed_file(filename):
#     return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# # search_mapping = {"naics": search_naics_disjoint, "gs1": search_gs1_disjoint, 'useeio': search_useeio_disjoint}
# search_mapping = {"naics": search_naics, "gs1": search_gs1, "useeio": search_useeio}
# corrector_mapping = {
#     "naics": search_corrector_naics,
#     "gs1": search_corrector_gs1,
#     "useeio": search_corrector_useeio,
# }
# file_kind_mapping = {"csv": "csv", "xlsx": "bom", "xls": "bom", "zip": "jsonld"}

# OPERATIONS = ('create-exchanges', 'create-datasets', 'update', 'disaggregate', 'replace', 'delete')
OPERATIONS = ('replace',)


def load_data_files():
    found = {}

    for filename in filter(lambda x: x.suffix.lower() == ".json", DATA_DIR.iterdir()):
        try:
            data = json.load(open(filename))
            for key in OPERATIONS:
                for elem in data.get(key, []):
                    if 'unit' in elem['source']:
                        elem['source']['unit'] = bi.units.UNITS_NORMALIZATION.get(elem['source']['unit'], elem['source']['unit'])
                    if frozendict(elem['source']) in found and found[frozendict(elem['source'])] != elem['target']:
                        print("Duplicate key:", frozendict(elem['source']), found[frozendict(elem['source'])], elem['target'])
                    found[frozendict(elem['source'])] = elem['target']
        except:
            pass
    return found


@dare_app.route("/match-status", methods=["GET"])
@auth.login_required
def match_status():
    crud = {}
    status = {}
    failed = []

    for filename in filter(lambda x: x.suffix.lower() == ".json", DATA_DIR.iterdir()):
        try:
            file_status = {'count': 0, 'duplicates': []}
            data = json.load(open(filename))
            for key in OPERATIONS:
                for elem in data.get(key, []):
                    lookup = frozendict(elem['source'])
                    value = frozendict(elem['target'])
                    file_status['count'] += 1
                    if lookup in crud and crud.get(lookup) != value:
                        error = "Source: {}. Already have: {}. Given: {}".format(dict(lookup), dict(crud[lookup]), dict(value))
                        if error not in file_status['duplicates']:
                            file_status['duplicates'].append(error)
                    else:
                        crud[lookup] = value
            status[filename.name] = file_status
        except:
            failed.append(filename.name)
            raise
    return flask.render_template(
        "match-status.html",
        failed=failed,
        status=[(key, value) for key, value in status.items()]
    )


@dare_app.route("/", methods=["GET"])
@auth.login_required
def index():
    bd.projects.set_current("DARE")
    return flask.render_template(
        "index.html",
        title="DARE Index Page",
        table_data=[obj for obj, _ in zip(bd.Database("uvek-2022"), range(50))],
        query_string="",
        database="uvek-2022",
    )


@dare_app.route("/ecoinvent/", methods=["GET"])
@auth.login_required
def ecoinvent():
    bd.projects.set_current("DARE")
    return flask.render_template(
        "index.html",
        title="DARE Index Page",
        table_data=[obj for obj, _ in zip(bd.Database("ecoinvent-3.9-cutoff"), range(50))],
        query_string="",
        database="ecoinvent-3.9-cutoff"
    )


@dare_app.route("/search/", methods=["GET"])
@auth.login_required
def search():
    bd.projects.set_current("DARE")
    q = flask.request.args.get("q")
    database = flask.request.args.get("database")
    source = flask.request.args.get("source")
    embed = flask.request.args.get("e")
    if embed:
        return flask.render_template(
            "search-embedded.html",
            source=source,
            table_data=bd.Database(database).search(q, limit=100),
        )
    else:
        return flask.render_template(
            "index.html",
            title="DARE Index Page",
            table_data=bd.Database(database).search(q, limit=100),
            query_string=q,
            database=database,
        )


@dare_app.route("/process/<id>", methods=["GET"])
@auth.login_required
def process_detail(id):
    bd.projects.set_current("DARE")
    node = bd.get_node(id=id)
    same_name = AD.select().where(AD.name == node['name'], AD.database == node['database'], AD.id != node.id)
    same_name_count = same_name.count()
    technosphere = sorted(node.technosphere(), key=lambda x: x.input['name'])

    if node['database'] == "ecoinvent-3.9-cutoff":
        return flask.render_template(
            "process_detail.html",
            title="DARE ecoinvent Detail Page",
            ds=node,
            same_name_count=same_name_count,
            same_name=same_name,
            technosphere=technosphere,
            show_matching=False,
        )
    elif node['database'] == "uvek-2022":
        found = load_data_files()
        ecoinvent = defaultdict(dict)
        for obj in bd.Database("ecoinvent-3.9-cutoff"):
            ecoinvent[frozendict({"name": obj['name'], "reference product": obj['reference product']})][obj['location']] = obj

        for exc in technosphere:
            key = frozendict({"name": exc.input['name'], "unit": exc.input['unit']})
            print(key)
            if key in found:
                ei_key = frozendict({"name": found[key]['name'], "reference product": found[key].get("reference product")})
                print("Keys:", found[key], ei_key)
                print("Locations:", node['location'], list(ecoinvent[ei_key]))
                exc['matched'] = True
                matches = ecoinvent[ei_key]
                exc['match'] = {}
                if exc.input['location'] in matches:
                    exc['match'] = matches[exc.input['location']]
                    continue
                else:
                    for guess in ('RER', 'RoW', 'GLO'):
                        if guess in matches:
                            exc['match'] = matches[guess]
                            continue
                print("Match:", key, exc['match'] or "missing")

        return flask.render_template(
            "process_detail.html",
            title="DARE FOEN Detail Page",
            ds=node,
            same_name_count=same_name_count,
            same_name=same_name,
            technosphere=technosphere,
            show_matching=True,
        )


@dare_app.route("/match/<source>", methods=["GET"])
@auth.login_required
def match(source):
    bd.projects.set_current("DARE")
    node = bd.get_node(id=source)

    matches = bd.Database("ecoinvent-3.9-cutoff").search(node['name'] + " " + node['location'])

    return flask.render_template(
        "match.html",
        title="DARE Matching Page",
        ds=node,
        query_string=node['name'] + " " + node['location'],
        matches=matches
    )


@dare_app.route("/compare/<source>/<target>", methods=["GET"])
@auth.login_required
def compare(source, target):
    # found = load_data_files()
    bd.projects.set_current("DARE")
    source = bd.get_node(id=int(source))
    target = bd.get_node(id=int(target))
    source_technosphere = sorted(source.technosphere(), key=lambda x: x['amount'], reverse=True)
    target_technosphere = sorted(target.technosphere(), key=lambda x: x['amount'], reverse=True)
    return flask.render_template(
        "compare.html",
        title="DARE Comparison Page",
        source=source,
        source_technosphere=source_technosphere,
        target=target,
        target_technosphere=target_technosphere,
    )


# @dare_app.route("/search", methods=["GET"])
# def search():
#     catalogue = request.args.get("catalogue")
#     search_term = request.args.get("search_term")
#     if not catalogue:
#         catalogue = list(search_mapping)[0]

#     if catalogue not in search_mapping:
#         abort(404)

#     if not search_term:
#         return render_template(
#             "search.html",
#             title="dare search",
#             catalogues=search_mapping,
#             catalogue=catalogue,
#         )
#     else:
#         search_results = search_mapping[catalogue](search_term, limit=5)

#         if len(search_term.split(" ")) == 1 and len(search_results) < 5:
#             correction_results = corrector_mapping[catalogue](search_term)[0]
#         else:
#             correction_results = []

#         if catalogue == "gs1":
#             for obj in search_results:
#                 obj["name"] = obj.pop("brick")

#         return render_template(
#             "search_result.html",
#             title="dare search result",
#             results=search_results,
#             corrections=correction_results,
#             search_term=search_term,
#             catalogue=catalogue,
#         )


# @dare_app.route("/export/<method>", methods=["POST"])
# def export_linked_data(method):
#     content = request.get_json()

#     if method == "ttl":
#         fp = write_matching_to_rdf(content)
#     elif method == "jsonld":
#         fp = write_matching_to_rdf(content, "json-ld", "json")
#     elif method == "csv":
#         fp = write_matching_to_csv_dataframe(content)
#     return jsonify({"fp": fp.name})


# @dare_app.route("/download/<path>", methods=["GET"])
# def download_export(path):
#     fp = export_dir / path
#     return send_file(fp, as_attachment=True)


# @dare_app.route("/file/<hash>", methods=["GET"])
# def uploaded_file(hash):
#     try:
#         file = File.get(sha256=hash)
#     except DoesNotExist:
#         raise (404)
#     data = mapping[file.kind](file.filepath)
#     return render_template(
#         "file.html",
#         title="File: {}".format(file.name),
#         filename=file.name,
#         data=data,
#         catalogues=list(search_mapping),
#         hash=hash,
#     )


# @dare_app.route("/upload", methods=["POST"])
# def upload():

#     # check if the post request has the file part
#     if "file_upload" not in request.files:
#         abort(400)
#     file = request.files["file_upload"]

#     # if user does not select file, browser also
#     # submit an empty part without filename
#     if file.filename == "":
#         flash("No selected file")
#         return redirect(url_for("index"))
#     if file and allowed_file(file.filename):
#         filehash = hashlib.sha256(file.read()).hexdigest()

#         try:
#             file_obj = File.get(sha256=filehash)
#             return redirect(url_for("uploaded_file", hash=file_obj.sha256))
#         except DoesNotExist:
#             file.seek(0)
#             filename = secure_filename(file.filename)
#             fn_path = Path(filename)
#             stem, suffix = fn_path.stem, fn_path.suffix
#             shorthash = filehash[:12]
#             filename = f"{stem}.{shorthash}{suffix}"
#             file.save(str(UPLOAD_FOLDER / filename))

#             file_obj = File.create(
#                 name=filename,
#                 filepath=UPLOAD_FOLDER / filename,
#                 kind=file_kind_mapping[suffix[1:]],
#                 sha256=filehash,
#             )
#             return redirect(url_for("uploaded_file", hash=file_obj.sha256))
#     else:
#         flash("The extension of the file provided may be wrong")
#         return redirect(url_for("index"))


# def normalize_search_results(result):
#     if "brick" in result:
#         return {
#             "description": result.pop("definition"),
#             "name": result.pop("brick"),
#             "class": result.pop("klass"),
#         }
#     else:
#         return result


# @dare_app.route("/get_search_results/<catalog>/<query>")
# def get_search_results(catalog, query):
#     search_function = search_mapping[catalog]
#     results = [normalize_search_results(o) for o in search_function(query)]
#     return jsonify(results)
