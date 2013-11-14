function getVal(node) {
    if(node.nodeName.toLowerCase() === "select")
        return node.children[node.selectedIndex].value;
}