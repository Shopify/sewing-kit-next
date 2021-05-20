import 'core-js/features/array/flat';
import 'core-js/features/array/flat-map';

import {build, dev, test, lint, typeCheck} from './commands';

const commands = new Map([
  ['build', build],
  ['dev', dev],
  ['test', test],
  ['lint', lint],
  ['type-check', typeCheck],
]);

run();

async function run() {
  const [, , ...args] = process.argv;
  const [command, ...argv] = args;
  const commandModule = commands.get(command);

  if (commandModule) {
    await commandModule(argv);
  } else {
    console.log(`Command not found: ${command} (${argv.join(' ')})`);
    process.exitCode = 1;
  }
}
