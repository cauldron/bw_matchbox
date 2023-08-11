import peewee
from bw2data import config, projects
from bw2data.sqlite import SubstitutableDatabase


class CommentThread(peewee.Model):
    resolved = peewee.BooleanField(default=False)
    name = peewee.TextField(null=False)
    process_id = peewee.IntegerField(null=False)

    def __len__(self):
        return Comment.select().where(Comment.thread == self.id).count()

    def comments(self):
        return (
            Comment.select()
            .where(Comment.thread == self.id)
            .order_by(Comment.position.asc())
        )

    @property
    def reporter(self):
        min_position = Comment.select(peewee.fn.Min(Comment.position)).where(Comment.thread == self).scalar()
        return Comment.get(position=min_position, thread=self).user

    def next_position(self):
        if not len(self):
            return 0
        else:
            return (
                Comment.select(peewee.fn.Max(Comment.position))
                .where(Comment.thread == self.id)
                .scalar()
            ) + 1

    class Meta:
        constraints = [peewee.SQL("UNIQUE (process_id, name)")]


class Comment(peewee.Model):
    thread = peewee.ForeignKeyField(CommentThread)
    position = peewee.IntegerField(null=False)
    content = peewee.TextField(null=False)
    # Don't want to bother with normalizing and CRUD for users
    # which are defined separate in app config anyway
    user = peewee.TextField(null=False)

    class Meta:
        constraints = [peewee.SQL("UNIQUE (thread_id, position)")]

    def save(self, *args, **kwargs):
        if not self.id:
            self.position = self.thread.next_position()
        return super().save(*args, **kwargs)


comments_db = SubstitutableDatabase(
    projects.dir / "comments.db",
    [CommentThread, Comment],
)
config.sqlite3_databases.append(
    (
        "comments.db",
        comments_db,
    )
)
