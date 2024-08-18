-- AlterTable
CREATE SEQUENCE oeeprocess_id_seq;
ALTER TABLE "oeeProcess" ALTER COLUMN "id" SET DEFAULT nextval('oeeprocess_id_seq');
ALTER SEQUENCE oeeprocess_id_seq OWNED BY "oeeProcess"."id";
