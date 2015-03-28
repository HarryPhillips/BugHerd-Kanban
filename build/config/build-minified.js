({
    baseUrl: "../../",
    paths: {
        src: "src",
        test: "test"
    },
    name: "kanban",
    out: "../dist/kanban.min.js",
    wrap: false,
    removeCombined: true,
    findNestedDependencies: true,
    uglify2: {
        mangle: true
    },
    optimize: "uglify2"
})