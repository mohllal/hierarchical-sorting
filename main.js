import fs from 'fs';
import path from 'path';

const COLUMN_SEPARATOR = '|';
const ROW_SEPARATOR = '\n';

const PROPERTY_NAME_MATCHER = /^property\d+$/i;
const TOTAL_PROPERTY_NAME = '$total';

class TreeNode {
  constructor({
    name = null,
    parent = null,
    metrics = {},
    children = [],
    map = new Map(),
    level = 0,
    pathToRoot = [],
  }) {
    this.name = name;
    this.parent = parent;
    this.metrics = metrics;
    this.children = children;
    this.map = map;
    this.level = level;
    this.pathToRoot = pathToRoot;
  }
}

// parse the file and return the dataset
const parseFile = ({ filePath }) => {
  const fileContent = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
  const [rawHeaders, ...rawRows] = fileContent.split(ROW_SEPARATOR);

  const formattedHeaders = rawHeaders.split(COLUMN_SEPARATOR);
  const propertiesHeaders = formattedHeaders.filter((t) => PROPERTY_NAME_MATCHER.test(t));
  const metricsHeaders = formattedHeaders.slice(propertiesHeaders.length);

  const propertiesRows = [];
  const metricsRows = [];
  rawRows.forEach((row) => {
    const cells = row.split(COLUMN_SEPARATOR);

    if (cells.indexOf(TOTAL_PROPERTY_NAME) !== -1) return;

    const properties = propertiesHeaders.map((t) => cells[formattedHeaders.indexOf(t)]);
    const metrics = metricsHeaders.map((t) => cells[formattedHeaders.indexOf(t)]);

    propertiesRows.push(properties);
    metricsRows.push(metrics);
  });

  return {
    propertiesHeaders,
    metricsHeaders,
    propertiesRows,
    metricsRows,
  };
};

// sift up metrics to parent nodes
const siftUpMetrics = ({ node }) => {
  let { parent } = node;
  const { metrics } = node;

  // sum-up metrics to parent nodes
  while (parent != null) {
    Object.keys(metrics)
      .forEach((metric) => { parent.metrics[metric] += parseInt(metrics[metric], 10); });
    parent = parent.parent;
  }
};

// build the hierarchical tree where each property node has N child property nodes
const buildTree = ({
  metricsHeaders,
  propertiesRows,
  metricsRows,
}) => {
  const placeholder = metricsHeaders.reduce((acc, curr) => {
    acc[curr] = 0;
    return acc;
  }, {});

  const root = new TreeNode({ metrics: Object.create(placeholder) });

  // iterate through all property rows to construct the tree
  // each property row is a node in the tree
  propertiesRows.map((propertyRow, index) => {
    let currentLevel = 1;
    let node = root;

    while (propertyRow.length) {
      const property = propertyRow.shift();

      if (node.map.has(property)) {
        node = node.map.get(property);
      } else {
        const nextNode = new TreeNode({
          name: property,
          parent: node,
          metrics: Object.create(placeholder),
          level: currentLevel,
          pathToRoot: [...node.pathToRoot, property],
        });

        node.children.push(nextNode);
        node.map.set(property, nextNode);
        node = nextNode;
      }
      currentLevel += 1;
    }

    node.metrics = metricsRows[index].reduce(
      (acc, curr, i) => {
        acc[metricsHeaders[i]] = parseInt(curr, 10);
        return acc;
      },
      {},
    );

    siftUpMetrics({ node });
    return node;
  });

  return root;
};

// sort the tree using the sort metric and build the output dataset
const sortTree = ({
  root,
  getSortValueFn,
  propertiesHeaders,
  metricsHeaders,
}) => {
  const queue = [root];
  const sorted = [];

  // pre-order tree traversal (root, right, left)
  while (queue.length) {
    const node = queue.pop();

    if (node.children && node.children.length) {
      node.children = node.children
        .sort((a, b) => getSortValueFn(a.metrics) - getSortValueFn(b.metrics));
      queue.push(...node.children);
    }

    const row = [
      ...node.pathToRoot,
      ...Array(propertiesHeaders.length - node.level).fill(TOTAL_PROPERTY_NAME),
    ];

    metricsHeaders.forEach((metric) => { row.push(node.metrics[metric]); });

    sorted.push(row.join(COLUMN_SEPARATOR));
  }

  return sorted;
};

const hierarchicalSort = ({ filePath, getSortValueFn }) => {
  const {
    propertiesHeaders,
    metricsHeaders,
    propertiesRows,
    metricsRows,
  } = parseFile({ filePath });

  const root = buildTree({
    metricsHeaders,
    propertiesRows,
    metricsRows,
  });

  const sorted = sortTree({
    root,
    getSortValueFn,
    propertiesHeaders,
    metricsHeaders,
  });

  const output = [
    [...propertiesHeaders, ...metricsHeaders].join(COLUMN_SEPARATOR),
    ...sorted,
  ].join(ROW_SEPARATOR);

  return output;
};

console.log(hierarchicalSort({
  filePath: '/tests/3.in',
  getSortValueFn: ((row) => row.net_sales),
}));

export default hierarchicalSort;
