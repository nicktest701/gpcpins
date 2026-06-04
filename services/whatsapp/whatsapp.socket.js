const sockets = new Map();

function getSocket(sessionId) {
  return sockets.get(sessionId);
}

function setSocket(sessionId, sock) {
  sockets.set(sessionId, sock);
}

function removeSocket(sessionId) {
  sockets.delete(sessionId);
}

module.exports = {
  getSocket,
  setSocket,
  removeSocket,
};
