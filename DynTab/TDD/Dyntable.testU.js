var DT = new DynTable(),
    datas = {
        header: [
            { value: "Compte", dataType: "text", sortable: true },
            { value: "Description", dataType: "descr", sortable: true },
            { value: "UOP", dataType: "bool", sortable: true },
            { value: "actif", dataType: "bool", sortable: true },
            { value: "ACTIM", dataType: "bool", sortable: true },
            { value: "GRT", dataType: "bool", sortable: true },
            { value: "GIENS", dataType: "bool", sortable: true },
            { value: "Forfait", dataType: "text", sortable: true },
            {
                value: "Unité", dataType: "ddl", sortable: true, values: [
                                                              { COMMUN: "COMMUN" },
                                                              { TELECOM: "TELECOM" },
                                                              { INFORMATIQUE: "INFORMATIQUE" }
                ]
            },
            { value: "id", dataType: "lineId" }
        ],
        body: [
            [1, "ligne de description numéro 1", 0, 1, 0, 1, 0, "générique", "COMMUN", "id1"],
                            [2, "ligne de description numéro 2", 1, 0, 1, 0, 1, "générique", "INFORMATIQUE", "id2"],
                            [3, "ligne de description numéro 3", 0, 1, 0, 0, 0, "générique", "COMMUN", "id3"],
                            [4, "ligne de description numéro 4", 1, 1, 1, 1, 1, "générique", "TELECOM", "id4"]
        ]
    };

DT.getTableTo("ici");

test("fct de restitution des données du tableau via getData()", function ()
{
    DT.setData(datas);
    propEqual(DT.getData(), {
        header:
            ["Compte", "Description", "UOP", "actif", "ACTIM", "GRT", "GIENS", "Forfait", "Unité", "id"],
        body: [
            [1, "ligne de description numéro 1", 0, 1, 0, 1, 0, "générique", "COMMUN", "id1"],
            [2, "ligne de description numéro 2", 1, 0, 1, 0, 1, "générique", "INFORMATIQUE", "id2"],
            [3, "ligne de description numéro 3", 0, 1, 0, 0, 0, "générique", "COMMUN", "id3"],
            [4, "ligne de description numéro 4", 1, 1, 1, 1, 1, "générique", "TELECOM", "id4"]],
        dataType: ["text", "descr", "bool", "bool", "bool", "bool", "bool", "text", "ddl", "lineId"],
        values: [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [
                                                                { COMMUN: "COMMUN" },
                                                                { TELECOM: "TELECOM" },
                                                                { INFORMATIQUE: "INFORMATIQUE" }]],
        sortable: [true, true, true, true, true, true, true, true, true, false]
    }, "descr test")
});

test("fct de restitution d'une ligne getLine('id2')", function ()
{
    propEqual(DT.getLine("id2"), [2, "ligne de description numéro 2", 1, 0, 1, 0, 1, "générique", "INFORMATIQUE", "id2"], "descr test");
});