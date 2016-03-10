module.exports = {
  admin: {
    user: {
      all: ['c', 'r', 'u', 'd'],
      group: ['c', 'r', 'u', 'd'],
      own: ['u', 'r']
    },
    stream: {
      all: ['c', 'r', 'u', 'd'],
      group: ['c', 'r', 'u', 'd'],
      own: ['c', 'r', 'u', 'd']
    },
    feed: {
      all: ['c', 'r', 'u', 'd'],
      group: ['c', 'r', 'u', 'd'],
      own: ['c', 'r', 'u', 'd']
    },
    message: {
      all: ['c', 'r', 'u', 'd'],
      group: ['c', 'r', 'u', 'd'],
      own: ['c', 'r', 'u', 'd']
    },
    group: {
      all: ['c', 'r', 'u', 'd'],
      group: ['c', 'r', 'u', 'd'],
      own: ['c', 'r', 'u', 'd']
    }
  },
  editor: {
    user: {
      all: [],
      group: ['r'],
      own: ['u', 'r']
    },
    stream: {
      all: ['c'],
      group: ['c', 'r', 'u', 'd'],
      own: ['c', 'r', 'u', 'd']
    },
    feed: {
      all: ['c'],
      group: ['c', 'r', 'u', 'd'],
      own: ['c', 'r', 'u', 'd']
    },
    message: {
      all: ['c'],
      group: ['c', 'r', 'u', 'd'],
      own: ['c', 'r', 'u', 'd']
    },
    message: {
      all: [],
      group: ['r'],
      own: ['r']
    }
  }
};