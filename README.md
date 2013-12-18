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
		{value: "drop down list", dataType: "ddl", values: [{"value1": "value1"}, {"value2": "value2"}, {"defaultVal": "defaultVal"}, {"value3": "value3"}]},
		{value: "some HTML", dataType: "html"},
		{value: "never display", dataType: "lineId"}
	],
	body: [
		["blablabla", "very big blablabla", 1, "defaultVal", "<input type='button' value='test' />", "id1"],
		["other text", "very VERY big blablabla...", 0, "value3", "<hr />", "id2"]
	]
}
```

* Ne nécessite pas jQuery
* Gère les évenements de suppression, d'ajout et de mise à jour des lignes (events on & before).
* Possibilité d'ajouter de l'AJAX pour chaque évenement à condition qu'il soit synchrone.
