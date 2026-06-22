export interface QueryResult<T = Record<string, unknown>> {
    rows: T[];
    rowCount: number | null;
}
declare function getPool(): any;
export declare function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
export { getPool };
export declare function runMigrations(): Promise<void>;
//# sourceMappingURL=connection.d.ts.map