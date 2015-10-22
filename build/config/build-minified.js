({
    baseUrl: "../../",
    paths: {
        main: "src/main",
        test: "src/test"
    },
    name: "kanban",
    out: "../../dist/kanban.min.js",
    wrap: true,
    removeCombined: true,
    findNestedDependencies: true,
    uglify2: {
        mangle: false
    },
    optimize: "uglify2"
})
