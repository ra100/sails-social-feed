module.exports = {
  admin: {
    user: {
      all: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      group: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      own: {
        u: true,
        r: true
      }
    },
    stream: {
      all: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      group: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      own: {
        c: true,
        r: true,
        u: true,
        d: true
      }
    },
    feed: {
      all: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      group: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      own: {
        c: true,
        r: true,
        u: true,
        d: true
      }
    },
    message: {
      all: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      group: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      own: {
        c: true,
        r: true,
        u: true,
        d: true
      }
    },
    group: {
      all: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      group: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      own: {
        c: true,
        r: true,
        u: true,
        d: true
      }
    }
  },
  editor: {
    user: {
      all: {
        r: false
      },
      group: {
        r: true
      },
      own: {
        u: true,
        r: true
      }
    },
    stream: {
      all: {
        c: true,
        r: false
      },
      group: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      own: {
        c: true,
        r: true,
        u: true,
        d: true
      }
    },
    feed: {
      all: {
        c: true,
        r: false
      },
      group: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      own: {
        c: true,
        r: true,
        u: true,
        d: true
      }
    },
    message: {
      all: {
        c: true,
        r: true
      },
      group: {
        c: true,
        r: true,
        u: true,
        d: true
      },
      own: {
        c: true,
        r: true,
        u: true,
        d: true
      }
    },
    group: {
      all: {
        r: false
      },
      group: {
        r: true
      },
      own: {
        r: true
      }
    }
  },
  user: {
    user: {
      all: {
        r: false
      },
      group: {
        r: true
      },
      own: {
        u: true,
        r: true
      }
    },
    stream: {
      all: {
        r: false
      },
      group: {
        r: true
      },
      own: {
        r: true
      }
    },
    feed: {
      all: {
        c: true
      },
      group: {
        r: true
      },
      own: {
        r: true
      }
    },
    message: {
      all: {
        r: true
      },
      group: {
        r: true
      },
      own: {
        r: true
      }
    },
    message: {
      all: {},
      group: {
        r: false
      },
      own: {
        r: false
      }
    }
  }
}