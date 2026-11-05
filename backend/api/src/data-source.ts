import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { dbConnection } from './config/db';
config();

// Under ts-node we load .ts files; from the compiled dist we must load .js only.
// (declaration:true also emits *.d.ts next to every migration, and a loose "*.ts" glob would try to execute them.)
const ext = __filename.endsWith('.ts') ? 'ts' : 'js';

export default new DataSource({
  type: 'postgres',
  ...dbConnection(process.env),
  entities: [__dirname + `/**/*.entity.${ext}`],
  migrations: [__dirname + `/database/[0-9]*-*.${ext}`],
  synchronize: false,
});
