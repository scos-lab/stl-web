/**
 * Custom Shiki TextMate grammar for STL (Semantic Tension Language).
 * Provides syntax highlighting for STL code blocks in documentation.
 */
export default {
  id: 'stl',
  scopeName: 'source.stl',
  patterns: [
    { include: '#comment' },
    { include: '#statement' },
  ],
  repository: {
    comment: {
      match: '#.*$',
      name: 'comment.line.number-sign.stl',
    },
    statement: {
      patterns: [
        { include: '#anchor' },
        { include: '#arrow' },
        { include: '#modifier' },
      ],
    },
    anchor: {
      match: '\\[([^\\]]+)\\]',
      name: 'entity.name.tag.stl',
      captures: {
        1: { name: 'entity.name.tag.stl' },
      },
    },
    arrow: {
      match: '->|→',
      name: 'keyword.operator.arrow.stl',
    },
    modifier: {
      begin: '::mod\\(',
      end: '\\)',
      beginCaptures: { 0: { name: 'keyword.other.modifier.stl' } },
      endCaptures: { 0: { name: 'keyword.other.modifier.stl' } },
      patterns: [
        { include: '#mod-key-value' },
      ],
    },
    'mod-key-value': {
      patterns: [
        {
          match: '(\\w+)\\s*=\\s*("(?:[^"\\\\]|\\\\.)*")',
          captures: {
            1: { name: 'variable.parameter.stl' },
            2: { name: 'string.quoted.double.stl' },
          },
        },
        {
          match: '(\\w+)\\s*=\\s*(\\d+\\.\\d+|\\d+)',
          captures: {
            1: { name: 'variable.parameter.stl' },
            2: { name: 'constant.numeric.stl' },
          },
        },
        {
          match: '(\\w+)\\s*=\\s*(true|false)',
          captures: {
            1: { name: 'variable.parameter.stl' },
            2: { name: 'constant.language.boolean.stl' },
          },
        },
      ],
    },
  },
};
