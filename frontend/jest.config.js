module.exports = {
    modulePaths: ['src', 'test'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
};
