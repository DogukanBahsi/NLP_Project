from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres.xybknjuubhmiqlejwupj:D0guk4n.8h8@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)

def connect():
    return engine.connect()