//CODE PRÉPARATOIRE
var DT = new DynTable(),
    datas = {
        header: [
            { value: "Compte", dataType: "text", sortable: true },
            { value: "Description", dataType: "descr", sortable: true },
            { value: "GIENS", dataType: "bool", sortable: true },
            {
                value: "Unité", dataType: "ddl", sortable: true, values: [
                                                              { COMMUN: "COMMUN" },
                                                              { TELECOM: "TELECOM" },
                                                              { INFORMATIQUE: "INFORMATIQUE" }
                ]
            },
            { value: "qqch en HTML", dataType: "html" },
            { value: "id", dataType: "lineId" }
        ],
        body: [
            [1, "ligne de description numéro 1", 0, "COMMUN", "<hr />", "id1"],
            [2, "ligne de description numéro 2", 1, "INFORMATIQUE", document.createElement("table"), "id2"],
            [3, "ligne de description numéro 3", 0, "COMMUN", document.createElement("td"),"id3"],
            [4, "ligne de description numéro 4", 1, "TELECOM", document.createElement("a"), "id4"]
        ]
    };

DT.getTableTo("ici");
DT.setData(datas);

test("fct de restitution des données du tableau via getData()", function ()
{
    propEqual(DT.getData(), {
        header:
            ["Compte", "Description", "GIENS", "Unité", "qqch en HTML", "id"],
        body: [
            [1, "ligne de description numéro 1", 0, "COMMUN", "<hr />", "id1"],
            [2, "ligne de description numéro 2", 1, "INFORMATIQUE", document.createElement("table"), "id2"],
            [3, "ligne de description numéro 3", 0,"COMMUN", document.createElement("td"), "id3"],
            [4, "ligne de description numéro 4", 1,"TELECOM", document.createElement("a"), "id4"]],
        dataType: ["text", "descr", "bool", "ddl", "html", "lineId"],
        values: [undefined, undefined, undefined, [
                                                    { COMMUN: "COMMUN" },
                                                    { TELECOM: "TELECOM" },
                                                    { INFORMATIQUE: "INFORMATIQUE" }]],
        sortable: [true, true, true, true, false, false]
    }, "descr test")
});

test("fct de restitution d'une ligne getLine('id2')", function ()
{
    propEqual(DT.getLine("id2"), [2, "ligne de description numéro 2", 1, "INFORMATIQUE", document.createElement("table"), "id2"], "descr test");
});

test("insertion d'une ligne dans le tableau insertDataBeforeLine()", function ()
{
    strictEqual(DT.insertDataBeforeLine([5, "ligne de description numéro 5", "p", "TELECOM", "<br />", "id5"]), false, "test de ligne échoué à cause d'une string passée à la place d'un chiffre");

    strictEqual(DT.insertDataBeforeLine([5, "ligne de description numéro 5", 2, "TELECOM", "<br />", "id5"]), false, "test de ligne échoué à cause d'un chiffre diférent de 0 et 1");

    strictEqual(DT.insertDataBeforeLine([5, "ligne de description numéro 5", 0, "AUTRE", "<br />", "id5"]), false, "test de ligne échoué à cause d'une de DDL inexistante");
});

test("fct de mise à jour d'une ligne updatetDataInLine()", function ()
{
    throws(function ()
    {
        DT.updatetDataInLine()
    }, /Argument/, "manque 1 ou 2 arguments");

    throws(function ()
    {
        DT.updatetDataInLine([4, "ligne de description numéro 4", 1, 1, 1, 1, 1, "générique", "TELECOM", document.createElement("a"), "id4"], "id44")
    }, /no line/, "l'id de la ligne à mettre à jour n'existe pas");
});