import { db, sql } from 'astro:db';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function inTransaction<T>(
  fn: (tx: Tx) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.run(sql`PRAGMA foreign_keys = ON`);
    return fn(tx as Tx);
  });
}
