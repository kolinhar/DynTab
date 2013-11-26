DynTab
======

##Tableau HTML dynamique en Javascript

Alimenté par un JSON de la forme:
```js
{
	header: [
		{value: "little text", dataType: "text"},
		{value: "big text", dataType: "descr"},
		{value: "yes/no", dataType: "bool"},
		{value: "drop down list", dataType: "ddl", values: ["value1", "value2", "defaultVal", "value3"]},
		{value: "never display", dataType: "lineId"}
	],
	body: [
		["blablabla", "very big blablabla", 1, "defaultVal", "id1"],
		["other text", "very VERY big blablabla...", 0, "value3", "id2"]
	]
}
```

* Ne nécessite pas jQuery
* Gère les évenements de suppression, d'ajout et de mise à jour des lignes (events on & before).
* Possibilité d'ajouter de l'AJAX pour chaque évenement à condition qu'il soit synchrone.
