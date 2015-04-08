({
    baseUrl: "../../",
    paths: {
        src: "src",
        test: "test"
    },
    name: "kanban",
    out: "../../dist/kanban.min.js",
    wrap: true,
    removeCombined: true,
    findNestedDependencies: true,
    uglify2: {
        mangle: true
    },
    optimize: "uglify2"
})