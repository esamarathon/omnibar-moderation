let serverDelay = 0;

export function getDate () {
  return Date.now() + serverDelay;
}

export function setServerDelay (serverTime) {
  serverDelay = serverTime - Date.now();
  console.log('Estimated server delay:', serverDelay);
}
