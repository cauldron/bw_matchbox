from datetime import datetime as dt
import json
import peewee
from bw2data import config, projects
from bw2data.sqlite import SubstitutableDatabase


class JSONField(peewee.TextField):
    """
    Class to "fake" a JSON field with a text field. Not efficient but works nicely
    """
    def db_value(self, value):
        """Convert the python value for storage in the database."""
        return value if value is None else json.dumps(value, indent=2, ensure_ascii=False)

    def python_value(self, value):
        """Convert the database value to a pythonic value."""
        return value if value is None else json.loads(value)


class LCIAScore(peewee.Model):
    method = peewee.JSONField(null=False)
    process_id = peewee.IntegerField(null=False)
    relinked = peewee.BooleanField(default=False)
    score = peewee.FloatField(null=False)
    created = peewee.DateTimeField(default=dt.utcnow)

    class Meta:
        constraints = [peewee.SQL("UNIQUE (process_id, method)")]


scores_db = SubstitutableDatabase(
    projects.dir / "lcia_scores.db",
    [LCIAScore],
)
config.sqlite3_databases.append(
    (
        "lcia_scores.db",
        scores_db,
    )
)
