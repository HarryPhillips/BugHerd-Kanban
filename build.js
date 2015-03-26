({
    paths: {
        src: "src",
        test: "test"
    },
    name: "kanban",
    out: "build/kanban.js",
    wrap: false,
    removeCombined: true,
    findNestedDependencies: true,
    uglify2: {
        mangle: false
    },
    optimize: "uglify2"
})