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
	],
	body: [
		["blablabla", "very big blablabla", 1, "defaultVal"],
		["other text", "very VERY big blablabla...", 0, "value3"]
	]
}
```

* Ne nécessite pas jQuery
* Gère les évenements de suppression, d'ajout et de mise à jour des lignes (events on & before).
* Possibilité d'ajouter de l'AJAX pour chaque évenement à condition qu'il soit synchrone.
