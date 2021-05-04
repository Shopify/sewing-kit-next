export function rollupNameForTargetOptions(options: {rollupName?: string}) {
  return (
    options.rollupName || (Object.keys(options).length === 0 ? 'main' : '')
  );
}
