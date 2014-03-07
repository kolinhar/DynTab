/*CRÉÉ UN TABLEAU DYNAMIQUE
* @param {Object} (Optionnal) objet
*/
var DynTable = function (objet)
{
    "use strict";

    //L'INSTANCE
    var _selfObj = this;

    //L'ÉLÉMENT CONTENANT LE TABLEAU
    var CIBLE = null;

    var Fct = function () { },
        Obj = {},
        TypeFct = typeof Fct,
        TypeObj = typeof Obj,
        FctTrue = function () { return true },
        FctFalse = function () { return false };

    //LES ÉVENEMENTS
    var EVENT = {
        //QUAND LA TABLE EST AFFICHÉE
        Rendered: undefined,
        //CLICK SUR UNE LIGNE
        LineClick: undefined,
        //AJOUT D'UNE LIGNE
        LineAdd: undefined,
        //LIGNE AJOUTÉE
        LineAdding: false,
        //AVANT L'AJOUT DÉFINITIF D'UNE LIGNE
        BeforeAdding: FctTrue,
        //MODIFICATION D'UNE LIGNE
        LineEdit: undefined,
        //ÉDITION D'UNE LIGNE,
        LineEditing: false,
        //AVANT LA MISE À JOUR D'UNE LIGNE
        BeforeUpdating: FctTrue,
        //SUPPRESSSION D'UNE LIGNE
        LineDelete: undefined,
        //AVANT LA SUPPRESSION D'UNE LIGNE
        BeforeDeleting: FctTrue,
        //LIGNE EXISTANTE SUPPRIMÉE
        LineDeleted: false,
        //INSERTION DE DONNÉES
        DataLoad: undefined,
        //DONNÉES AJOUTÉES
        DataLoading: false,
        //TRI SUR LES COLONNES
        Sort: undefined,
        //DONNÉES TRIÉES
        Sorting: false
    };

    //MODELE DE DONNÉES ATTENDU
    var DataModele = { header: [{}], body: [[]] },
        //LES DONNÉES À TRAITER
        DATA = {
            header: [],
            body: [],
            dataType: [],
            values: [],
            sortable: []
        };

    //INFOS RELATIVES AU TABLEAU                
    var TABLE = {
        //IDENTIFIANT DE LA TABLE
        ID: "DynTable",
        //NOMBRE DE COLONNES
        COLS: 0,
        //NOMBRE DE LIGNES
        ROWS: 0,
        //CLIQUER UNE LIGNE
        CLIL: false,
        //AJOUTER DES LIGNES
        ADDL: { on: false, before: false },
        //EDITER DES LIGNES
        UPDL: { on: false, before: false },
        //SUPPRIMER DES LIGNES
        DELL: { on: false, before: false },
        //MODIFIER LES DONNÉES
        LOAD: false,
        //PAGINATION
        PAGIN: 30,
        //INITIALISÉ
        ISINIT: false,
        //HREF
        FOLLOW: true
    };

    /*DEBUG
    * SI ON EST SUR IE PAR DÉFAUT ON EST PAS EN DEBUG (PB AVEC LA CONSOLE)
    * oui je sais : c'est de la discrimination pour les IE récents, 
    * mais quand on t'a contraint à coder pour IE8... tu vois la vie différemment
    */
    var _DEBUG = (navigator.appName === "Microsoft Internet Explorer" ? false : location.hostname === "localhost");
    //INDIQUE SI ON EST EN DEBUG
    this.Debug = function ()
    {
        return _DEBUG;
    }

    //FORCE LE DEBUG
    this.Debug.SetOn = function ()
    {
        _DEBUG = true;
        return _DEBUG;
    }

    //FORCE L'ARRET DU DEBUG
    this.Debug.SetOff = function ()
    {
        _DEBUG = false;
        return _DEBUG;
    }


    /**********************
        REGION EVENTS
    */

    /*QUAND LA TABLE EST DESSINÉE
    * @param {Function(elt)} handler : fonction éxecutée après le rendu graphique du tableau
    */
    this.onRendered = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onRendered";

        EVENT.Rendered = handler;
    }

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONRENDERED
    */
    this.onRendered.Stop = function ()
    {
        EVENT.Rendered = undefined;
    }

    /*LA TABLE EST AFFICHÉE
    * @param {Element} elt : la table HTML
    */
    var Rendered = function (elt)
    {
        EVENT.Rendered && EVENT.Rendered(elt);
    }

    /*QUAND ON CLICK SUR UNE LIGNE
    * @param {Function(e, elt)} handler : fonction éxecutée au click d'ajout d'une ligne
    */
    this.onLineClick = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onLineClick";

        EVENT.LineClick = handler;
        TABLE.CLIL = true;
    };

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONLINECLICK
    */
    this.onLineClick.Stop = function ()
    {
        EVENT.LineClick = undefined;
        TABLE.CLIL = false;
    };

    /*QUAND UNE LIGNE EST AJOUTÉE
    * @param {Function(e, elt)} handler : fonction éxecutée au click d'ajout d'une ligne
    */
    this.onLineAdd = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onLineAdd";

        EVENT.LineAdd = handler;
        TABLE.ADDL.on = true;
    };

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONLINEADD
    */
    this.onLineAdd.Stop = function ()
    {
        EVENT.LineAdd = undefined;
        TABLE.ADDL.on = false;
    };

    /*AJOUTE UNE LIGNE EN ÉDITION AU TABLEAU
    * @param {Object} e : cible
    * @returns {Element} : l'élément inséré
    */
    var LineAdd = function (e)
    {
        var tr = e.target.parentNode.parentNode,
            trPrev = tr.previousSibling,
            tbody = tr.parentNode,
            trIns = document.createElement("tr");

        trIns.className = "dyntab-selected";
        trIns.id = "Tline" + Math.random().toString().replace('.', '');

        for (var i = 0; i < TABLE.COLS; i++) {
            var td = document.createElement("td");
            td.align = "center";
            if (DATA.dataType[i] === "ddl") {
                td.appendChild(_getDdl(i));
            }
            else
                td.appendChild(_getElement(DATA.dataType[i]));

            trIns.appendChild(td);
        }

        var tdFin = document.createElement("td"),
            buttonVal = document.createElement("button"),
            buttonDel = document.createElement("button");

        tdFin.className = "dyntab-alter";

        //ANNULE L'AJOUT DE LA LIGNE
        buttonDel.innerHTML = "&#x2718;";
        buttonDel.title = "Annuler la saisie"
        buttonDel.addEventListener("click", function (e)
        {
            //EMPÊCHE L'ÉVENEMENT DE REMONTER ET DE DÉCLENCHER ONLINECLICK
            e.stopPropagation();
            //SUPPRESSION DE LA LIGNE
            var tr = e.target.parentNode.parentNode,
                tbody = tr.parentNode;
            tbody.removeChild(tr);
            //LIBÉRATION DE LA LIGNE
            EVENT.LineAdding = false;

            if (trPrev && TABLE.FOLLOW)
                location.replace(location.pathname + "#" + trPrev.id);

            _getButtonPlus(document.getElementById(TABLE.ID));
        });

        //VALIDE L'AJOUT DE LA LIGNE
        buttonVal.innerHTML = "&#x2714;";
        buttonVal.title = "Valider la saisie";
        buttonVal.addEventListener("click", function (e)
        {
            //EMPÊCHE L'ÉVENEMENT DE REMONTER ET DE DÉCLENCHER ONLINECLICK
            e.stopPropagation();
            //DEMANDE DE CONFIRMATION
            if (!EVENT.BeforeAdding(e, trIns))
                return;

            TABLE.ROWS++;

            //MISE À JOUR DU TABLEAU
            var oldTr = trIns,
                newTr = document.createElement("tr"),
                data = [];

            newTr.id = oldTr.id;

            for (var i = 0; i < DATA.header.length; i++) {
                var td = document.createElement("td");

                switch (DATA.dataType[i]) {
                    case "text":
                    case "descr":
                        td.innerHTML = _getVal(oldTr.childNodes[i]);

                        data.push(_getVal(oldTr.childNodes[i]));
                        break;
                    case "bool":
                        var chkbx = _getElement("bool");
                        chkbx.checked = _getVal(oldTr.childNodes[i]);
                        chkbx.disabled = true;
                        td.appendChild(chkbx);
                        td.align = "center";

                        data.push(~~_getVal(oldTr.childNodes[i]));
                        break;
                    case "ddl":
                        var ddl = _getDdl(i, _getVal(oldTr.childNodes[i]));
                        ddl.disabled = true;
                        td.appendChild(ddl);

                        data.push(_getVal(oldTr.childNodes[i]));
                        break;
                    case "lineId":
                        //ON AJOUTE L'IDENTIFIANT DE LIGNE
                        data.push(trIns.id);
                        break;
                    case "html":
                        td = oldTr.childNodes[i];

                        data.push(oldTr.childNodes[i].children);
                        break;
                    default:
                        td.innerHTML = _getVal(oldTr.childNodes[i]);

                        data.push(_getVal(oldTr.childNodes[i]));
                        break;
                }


                if (DATA.dataType[i] !== "lineId")
                    newTr.appendChild(td);
            }

            if (_DEBUG)
                console.log(data);

            //ENREGISTREMENT DES DONNÉES
            DATA.body.splice(trIns.rowIndex - 1, 0, data);

            //AJOUT DES BOUTONS
            newTr.appendChild(_getButtons());

            //LIBÉRATION DE LA LIGNE
            EVENT.LineAdding = false;

            //AJOUT DES STYLES
            newTr.classList.remove("dyntab-selected");
            newTr.classList.add("dyntab-new");

            //AFFICHAGE DE LA NOUVELLE LIGNE
            oldTr.parentNode.replaceChild(newTr, oldTr);

            if (TABLE.FOLLOW)
                location.replace(location.pathname + "#" + newTr.id);
        });

        tdFin.appendChild(buttonVal);
        tdFin.appendChild(buttonDel);

        trIns.appendChild(tdFin);

        tbody.insertBefore(trIns, tr);

        if (TABLE.FOLLOW)
            location.replace(location.pathname + "#" + trIns.id);

        trIns.firstChild.firstChild.focus();

        //ON RETOURNE LA LIGNE INSÉRÉE
        return trIns;
    };

    /*AVANT D'AJOUTER DÉFINITIVEMENT UNE LIGNE AU TABLEAU
    * @param {Function(e, elt) returns bool} handler : fonction éxecutée au click de confirmation de création d'une ligne
    */
    this.onBeforeAdding = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onBeforeAdding";

        EVENT.BeforeAdding = handler;
        TABLE.ADDL.before = true;
    };

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONBEFOREADDING
    */
    this.onBeforeAdding.Stop = function ()
    {
        EVENT.BeforeAdding = FctTrue;
        TABLE.ADDL.before = false;
    };

    /*QUAND UNE LIGNE EST ÉDITÉE
    * @param {Function(e, elt)} handler : fonction éxecutée au click d'édition d'une ligne
    */
    this.onLineEdit = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onLineEdit";

        EVENT.LineEdit = handler;
        TABLE.UPDL.on = true;
    };

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONLINEEDIT
    */
    this.onLineEdit.Stop = function ()
    {
        EVENT.LineEdit = undefined;
        TABLE.UPDL.on = false;
    }

    /*EDITE UNE LIGNE DU TABLEAU
    * @param {Object} e : cible
    * @returns  {Element} : la ligne en édition
    */
    var LineUpd = function (e)
    {
        var tr = e.target.parentNode.parentNode,
            tbody = tr.parentNode;

        tr.classList.add("dyntab-selected");

        for (var i = 0; i < DATA.header.length; i++) {
            //ON MODIFIE LES CHAMPS SI IL NE S'AGIT PAS D'UN LINEID
            if (DATA.dataType[i] !== "lineId" && DATA.dataType[i] !== "html") {
                var l_cel = _getElement(DATA.dataType[i], tr.children[i]);
                //VIDE LE CHAMP
                tr.children[i].innerHTML = "";
                //ET LUI AJOUT L'ÉLÉMENT CORRESPONDANT
                tr.children[i].appendChild(l_cel);
            }
        }

        var newButtons = document.createElement("td"),
            btn1 = document.createElement("button"),
            btn2 = document.createElement("button");

        btn1.innerHTML = "&#x2714;";
        btn1.title = "Valider les modifications";

        btn2.innerHTML = "&#x2718;";
        btn2.title = "Annuler les modifications";

        //AJOUT DES BOUTONS AU TD
        newButtons.appendChild(btn1);
        newButtons.appendChild(btn2);
        newButtons.className = "dyntab-alter";
        //BOUTONS À REPLACER
        var oldButtons = tr.replaceChild(newButtons, tr.lastChild);

        //ENREGISTREMENT DE LA SAISIE
        btn1.addEventListener("click", function (e)
        {
            //EMPÊCHE L'ÉVENEMENT DE REMONTER ET DE DÉCLENCHER ONLINECLICK
            e.stopPropagation();
            //DEMANDE DE CONFIRMATION
            if (!EVENT.BeforeUpdating(e, tr))
                return;

            tr.classList.remove("dyntab-selected");

            for (var i = 0; i < DATA.dataType.length; i++) {

                var l_cel = document.createElement("td");

                switch (DATA.dataType[i]) {
                    case "text":
                    case "descr":
                        DATA.body[tr.rowIndex - 1][i] = _getVal(tr.children[i]);

                        l_cel.appendChild(document.createTextNode(DATA.body[tr.rowIndex - 1][i]));
                        break;
                    case "bool":
                        DATA.body[tr.rowIndex - 1][i] = ~~_getVal(tr.children[i]);

                        var chkbx = _getElement("bool", tr.firstChild.children[i]);
                        chkbx.checked = _getVal(tr.children[i]);
                        chkbx.disabled = true;

                        l_cel.appendChild(chkbx);
                        l_cel.align = "center";
                        break;
                    case "ddl":
                        DATA.body[tr.rowIndex - 1][i] = _getVal(tr.children[i]);

                        var ddl = tr.childNodes[i].firstChild;
                        ddl.disabled = true;

                        l_cel.appendChild(ddl);
                        break;
                    case "lineId":
                        //ON NE MODIFIE PAS L'IDENTIFIANT EXISTANT
                        break;
                    case "html":
                        //PAS DE MODIFICATION
                        DATA.body[tr.rowIndex - 1][i] = tr.children[i].children;

                        l_cel = tr.children[i];
                        break;
                    default:
                        DATA.body[tr.rowIndex - 1][i] = _getVal(tr.children[i]);

                        l_cel.appendChild(document.createTextNode(DATA.body[tr.rowIndex - 1][i]));
                        break;
                }

                if (DATA.dataType[i] !== "lineId")
                    tr.replaceChild(l_cel, tr.children[i]);
            }

            tr.replaceChild(oldButtons, newButtons);

            if (TABLE.FOLLOW)
                location.replace(location.pathname + "#" + tr.id);

            EVENT.LineEditing = false;
        });

        //ANNULATION DE LA SAISIE
        btn2.addEventListener("click", function (e)
        {
            //EMPÊCHE L'ÉVENEMENT DE REMONTER ET DE DÉCLENCHER ONLINECLICK
            e.stopPropagation();

            tr.classList.remove("dyntab-selected");

            for (var i = 0; i < DATA.dataType.length; i++) {

                var l_cel = document.createElement("td");

                switch (DATA.dataType[i]) {
                    case "text":
                    case "descr":
                        l_cel.innerHTML = DATA.body[tr.rowIndex - 1][i] || "";
                        break;
                    case "bool":
                        var chkbx = _getElement("bool");
                        chkbx.checked = DATA.body[tr.rowIndex - 1][i];
                        chkbx.disabled = true;
                        l_cel.appendChild(chkbx);
                        l_cel.align = "center";
                        break;
                    case "ddl":
                        var ddl = _getDdl(i, DATA.body[tr.rowIndex - 1][i]);
                        ddl.disabled = true;
                        l_cel.appendChild(ddl);
                        break;
                    case "lineId":
                        //ON EN FAIT RIEN SI C'EST UN CHAMPS LINEID
                        break;
                    case "html":
                        l_cel = tr.children[i];
                        break;
                    default:
                        l_cel.innerHTML = DATA.body[tr.rowIndex - 1][i] || "";
                        break;
                }

                //ONE NE REMPLACE L'ÉLÉMENT QUE SI CE N'EST PAS UN LINEID
                if (DATA.dataType[i] !== "lineId")
                    tr.replaceChild(l_cel, tr.children[i]);
            }

            tr.replaceChild(oldButtons, newButtons);

            if (TABLE.FOLLOW)
                location.replace(location.pathname + "#" + tr.id);

            EVENT.LineEditing = false;
        });

        //FOCUS L'ÉDITION DE LA LIGNE SINON LE SCROLL PART N'IMPORTE OÙ
        if (TABLE.FOLLOW)
            location.replace(location.pathname + "#" + tr.id);

        tr.firstChild.firstChild.focus();

        return tr;
    };

    /*AVANT DE MODIFIER DÉFINITIVEMENT UNE LIGNE AU TABLEAU
    * @param {Function(e, elt) return bool} handler : fonction éxecutée au click de confirmation de modification d'une ligne
    */
    this.onBeforeUpdating = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onBeforeUpdating";

        EVENT.BeforeUpdating = handler;
        TABLE.UPDL.before = true;
    }

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONBEFOREUPDATING
    */
    this.onBeforeUpdating.Stop = function ()
    {
        EVENT.BeforeUpdating = FctTrue;
        TABLE.UPDL.before = false;
    };

    /*QUAND UNE LIGNE EST SUPPRIMÉE
    * @param {Function(e, elt)} handler : fonction éxecutée au click de suppression d'une ligne
    */
    this.onLineDelete = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onLineDelete";

        EVENT.LineDelete = handler;
        TABLE.DELL.on = true;
    };

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONLINEDELETE
    */
    this.onLineDelete.Stop = function ()
    {
        EVENT.LineDelete = undefined;
        TABLE.DELL.on = false;
    };

    /*SUPPRIME UNE LIGNE AU TABLEAU
    * @param {Object} e : cible
    * @returns {Element} : l'élément supprimé
    */
    var LineDel = function (e)
    {
        var tr = e.target.parentNode.parentNode,
            tbody = tr.parentNode;

        //DEMANDE DE CONFIRMATION
        if (!EVENT.BeforeDeleting(e, tr))
            return;

        //ON SUPPRIME LA LIGNE CORRESPONDANTE DANS LE TABLEAU DE DONNÉES
        DATA.body.splice(tr.rowIndex - 1, 1);

        TABLE.ROWS--;

        //BOUTON ADD
        _getButtonPlus(tbody.parentElement);

        //ON SUPPRIME AUSSI LA LIGNE DANS LE TABLEAU ET ON LA  RETOURNE
        return tbody.removeChild(tr);
    };

    /*AVANT DE SUPPRIMER DÉFINITIVEMENT UNE LIGNE AU TABLEAU
    * @param {Function(e, elt) returns bool} handler : fonction éxecutée avant la suppression d'une ligne
    */
    this.onBeforeDeleting = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onBeforeDeleting";

        EVENT.BeforeDeleting = handler;
        TABLE.DELL.before = true;
    };

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONBEFOREDELETING
    */
    this.onBeforeDeleting.Stop = function ()
    {
        EVENT.BeforeDeleting = FctTrue;
        TABLE.DELL.before = false;
    };

    /*QUAND UN NOUVEAU JEU DE DONNÉES EST CHARGÉ DANS LE TABLEAU
    * @param {Object} oldDatas : l'ancien jeu de données
    * @param {Object} newDatas : le nouveau jeu de données
    */
    var DataLoad = function (oldDatas, newDatas)
    {
        //ÉVENEMENT PERSONNALISÉ
        EVENT.DataLoad && EVENT.DataLoad(oldDatas, newDatas);

        //SOMETHING @TODO ... LATER
    }

    /*QUAND UN JEU DE DONNÉES EST INSERÉ DANS LE TABLEAU EN PLACE
    * @param {Function(dataOld, dataNew)} handler : fonction éxecutée à la fin du chargement des données
    */
    this.onDataLoad = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onDataLoad";

        EVENT.DataLoad = handler;
    };

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONDATALOAD
    */
    this.onDataLoad.Stop = function ()
    {
        EVENT.DataLoad = undefined;
    };

    /*QUAND UNE COLONNE DU TABLEAU EST TRIÉE
    * @param {Element} th : la colonne à trier
    * @param {Number} direction : le sens de tri
    */
    var Sort = function (th, direction)
    {
        EVENT.LineAdding = false;
        EVENT.LineEditing = false;
        EVENT.Sorting = true;
        EVENT.Sort && EVENT.Sort(th, direction);
    };

    /*QUAND ON TRI LE TABLEAU
    * @param {Function(th, direction)}
    */
    this.onSort = function (handler)
    {
        if (typeof handler !== TypeFct)
            throw "this handler is not a function for onSort";

        EVENT.Sort = handler;
    };

    /*ANNULE L'ÉCOUTE DE L'ÉVENEMENT ONSORT
    */
    this.onSort.Stop = function ()
    {
        EVENT.Sort = undefined;
    };

    /*
        REGION EVENTS
    **********************/


    /**********************
        REGION
    */

    /*DÉPLACE LE SCROLL OU NON LORS DE L'AJOUT/MODIFICATION D'UNE LIGNE DU TABLEAU
    * @param {Bool} focus
    */
    this.Href = function (focus)
    {
        if (typeof focus !== "boolean")
            throw "Argument wrong";

        TABLE.FOLLOW = focus;
    }

    /*
        REGION
    **********************/



    /**********************
        REGION
    */

    /*RETOURNE LA LIGNE SÉLÉCTIONNÉE
    * @param {String/Number} id : identifiant de ligne
    * @return {Array} : les données utilisées par l'instance correspondant à la ligne
    */
    this.getLine = function (id)
    {
        //POSITION DE L'IDENTIFIANT
        var idPosition = DATA.dataType.indexOf("lineId");

        for (var i = 0; i < DATA.body.length; i++)
            if (DATA.body[i][idPosition].toString() === id.toString())
                return DATA.body[i];

        //LIGNE INTROUVABLE
        return
    }

    /*AJOUTE UNE LIGNE DYNAMIQUEMENT
    * @param {Array} line : les données de la ligne à insérer
    * @param {String/Number} (optionnal) id : l'identifiant de la ligne au-dessus de laquelle doit être insérée la nouvelle ligne. Si absent la ligne est placée en fin de tableau
    * @returns {Bool} : true si tout s'est bien passé
    */
    this.insertDataBeforeLine = function (line, id)
    {
        if (_isCorrectLine(line)) {
            //AJOUT DE LIGNE À UN ENDROIT PRÉCIS
            if (id) {
                //@HACK : notation document.querySelector("#" + TABLE.ID + " #" + id); plante
                var elt = document.querySelector("#" + TABLE.ID + " tr[id='" + id + "']"),
                    position = _getIndixById(id) || DATA.body.length;

                //SI L'ÉLÉMENT HTML EXISTE ET QU'ON TROUVE LA LIGNE DANS LES DATA INTERNES
                if (elt && position) {
                    console.log("insertion précise", elt);
                    //AJOUT D'UN ID SI IL N'EST PAS FOURNIE
                    if ((line.length + 1) === DATA.dataType.length)
                        line.push(_getId(true));

                    DATA.body.splice(position, 0, line);
                    TABLE.ROWS++;
                    elt.parentElement.insertBefore(_createLine(line), elt);
                    return true;
                }
            }

            console.log("insertion à la fin");
            //AJOUT EN FIN DE TABLEAU
            var elt = document.getElementById(TABLE.ID).children[1];
            //AJOUT D'UN ID SI IL N'EST PAS FOURNIE
            if ((line.length + 1) === DATA.dataType.length)
                line.push(_getId(true));

            DATA.body.push(line);
            TABLE.ROWS++;
            elt.appendChild(_createLine(line));
            return true;
        }
        return false;
    }

    /*MODIFIE LA LIGNE DYNAMIQUEMENT
    * @param {Array} ligne : les données de la ligne à modifier
    * @param {String/Number} id : l'identifiant de la ligne à modifier
    * @returns {Bool} : true si tout s'est bien passé
    */
    this.updateDataInLine = function (line, id)
    {
        if (arguments.length !== 2)
            throw "Argument(s) null";

        //@HACK : notation document.querySelector("#" + TABLE.ID + " #" + id); plante
        var elt = document.querySelector("#" + TABLE.ID + " tr[id='" + id + "']");
        if (!elt)
            throw "There is no line with the id '" + id + "' in this table";

        if (_isCorrectLine(line)) {
            var position = _getIndixById(id);

            DATA.body.splice(position, 1, line);
            var newLine = _createLine(line);
            if (!newLine.id)
                newLine.id = id;

            elt.parentNode.replaceChild(newLine, elt);
            return true;
        }
        return false;
    }

    /*RETOURNE LA POSITION D'UNE LIGNE EN FONCTION DE SON IDENTIFIANT DE LIGNE
    * @param {String/Number} idLine : identifiant de ligne
    * @returns {Number} : l'indice de la ligne dans DATA.body
    */
    var _getIndixById = function (idLine)
    {
        var lineIdIndix = DATA.dataType.indexOf("lineId"),
            ret = [];

        DATA.body.filter(function (val, ind, arr)
        {
            if (val[lineIdIndix] === idLine)
                ret.push(ind);
            /*
              NE RÉAGIT PAS COMME PRÉVUE SI ON FAIT "return ind"
              RETOURNE L'ÉLÉMENT AU LIEU DE L'INDICE ?????
              OBLIGÉ DE PASSER PAR LA VARIABLE ret
            */
        });

        return ret[0];
    }
    /*
        REGION
    **********************/


    /*INITIALISE LES DONNÉES DU TABLEAU
    * @param {Object} obj
    */
    this.setData = function (obj)
    {
        //VÉRIF DU TYPE
        if (typeof obj !== TypeObj) {
            if (_DEBUG)
                console.log(obj, "is not an Object");

            throw "Argument is not an Object";
        }

        //VÉRIF DU MODELE
        for (var i in DataModele) {
            if (obj[i] === undefined) {
                if (_DEBUG)
                    console.log(obj, "isn't look like the expected model", DataModele);
                throw "Object isn't look like the expected model";
            }
        }

        //COPIE LES ANCIENNES DONNÉES
        ////MÉTHODE RAPIDE
        //var oldData = JSON.parse(JSON.stringify(DATA));
        //MÉTHODE LA PLUS RAPIDE (http://jsperf.com/cloning-an-object/2)
        var oldData = function clone(obj)
        {
            var target = {};
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    target[i] = obj[i];
                }
            }
            return target;
        }(DATA)

        //SI ON MODIFIE LES DONNÉES EN COURS D'INSTANCE, ON REDESSINE LE TABLEAU
        if (TABLE.ISINIT) {
            DATA.header = [];
            DATA.dataType = [];
            DATA.values = [];
            DATA.body = [];
            DATA.sortable = [];
        }

        //RÉINITIALISATION DES ÉVENEMENTS
        EVENT.LineAdding = false,
        EVENT.LineEditing = false,
        EVENT.LineDeleted = false;

        //ON APPLIQUE UNIQUEMENT CE DONT ON A BESOIN POUR LE TABLEAU
        //EN-TETES
        for (var i = 0; i < obj.header.length; i++) {
            DATA.header.push(obj.header[i].value);
            DATA.dataType.push(obj.header[i].dataType);

            if (obj.header[i].dataType === "ddl")
                DATA.values[i] = obj.header[i].values;

            if (obj.header[i].sortable === true)
                DATA.sortable.push(true);
            else
                DATA.sortable.push(false);
        }

        //SEULEMENT 1 LINEID MAX PAR LIGNE
        var cpt_id = DATA.dataType.filter(function (val, ind, arr) { return val === "lineId" }).length;
        if (cpt_id > 1)
            throw "Only 1 'lineId' max";

        //ON AJOUTE UN LINEID AUX DONNÉES SI IL N'Y EN A PAS
        if (cpt_id === 0)
            DATA.dataType.push("lineId");

        //CORPS
        for (var j = 0; j < obj.body.length; j++) {
            DATA.body[j] = [];
            for (var k = 0; k < obj.body[j].length; k++)
                DATA.body[j].push(obj.body[j][k]);

            if (cpt_id === 0)
                DATA.body[j][DATA.body[j].length] = _getId(true);

        }

        //ON SE BASE SUR LES ENTÊTES POUR LE NOMBRE DE COLONNES - LE CHAMPS LINEID
        TABLE.COLS = DATA.dataType.length - 1;
        TABLE.ROWS = DATA.body.length;

        //SI DES ÉVENEMENTS ONT ÉTÉ AJOUTÉS
        if (obj.addLines !== undefined)
            TABLE.ADDL.on = obj.addLines;

        if (obj.updLines !== undefined)
            TABLE.UPDL.on = obj.updLines;

        if (obj.delLines !== undefined)
            TABLE.DELL.on = obj.delLines;

        //SI ON MODIFIE LES DONNÉES EN COURS D'INSTANCE
        if (TABLE.ISINIT) {
            objet = obj;

            //ON RECONSTRUIT LE TABLEAU
            CIBLE.removeChild(document.getElementById(TABLE.ID));
            CIBLE.appendChild(_draw());

            //TABLEAU AFFICHÉ
            Rendered(document.getElementById(TABLE.ID));

            TABLE.LOAD = true;
            //ÉVENEMENT D'AJOUT DE DONNÉES
            EVENT.DataLoad && EVENT.DataLoad(oldData, DATA);
        }
    }

    /*CRÉÉ LE TABLEAU SOUS FORME DE TABLE HTML
    * returns {Element} : la table HTML
    */
    var _draw = function ()
    {
        /*
        * méthode JS natif (document.createElement("HTML"))
        * 7 colonnes * 487 lignes
        * chrome entre 40 et 55 ms
        * firefox: entre 33 et 35 ms
        *
        * méthode Array (arr.push("HTML"))
        * 7 colonnes * 487 lignes
        * chrome entre 2 et 6ms
        * firefox: entre 1 et 3ms
        *
        * méthode String (str += "HTML")
        * 7 colonnes * 487 lignes
        * chrome entre 1 et 6 ms
        * firefox: entre 1 et 2 ms
        *
        * Résultats complètement différents sur 
        * http://jsperf.com/string-vs-array-vs-js
        */
        var TabHTML = document.createElement("table");
        TabHTML.id = TABLE.ID;
        TabHTML.className = "dyntab-table";

        //ENTÊTE DU TABLEAU
        TabHTML.createTHead();

        var TR = document.createElement("tr");

        for (var i = 0; i < DATA.header.length; i++) {

            //NE PAS AFFICHER LE CHAMPS LINEID, IL SERT À INDIQUER L'IDENTIFIANT DE LA LIGNE
            if (DATA.dataType[i] !== "lineId") {
                var thCell = document.createElement("th");
                thCell.appendChild(document.createTextNode(DATA.header[i]));

                //TRI SUR COLONNE
                if (DATA.sortable[i] === true) {
                    //SENS DE TRI
                    thCell.setAttribute("data-sort-direction", "1");
                    var sortText = document.createTextNode(" ▼");

                    //TRI AU CLICK
                    thCell.addEventListener("click", function (e)
                    {
                        var cible = e.target,
                            position = cible.cellIndex,
                            nomCol = cible.firstChild.nodeValue,
                            sens = parseInt(cible.getAttribute("data-sort-direction"), 10);

                        //"ÉVENEMENT" DE TRI SUR LE TABLEAU
                        Sort(cible, -sens);

                        //CHANGEMENT DE SENS DANS L'ENTÊTE
                        if (sens > 0) {
                            cible.setAttribute("data-sort-direction", "-1");
                            cible.lastChild.nodeValue = " ▲";
                        }
                        else {
                            cible.setAttribute("data-sort-direction", "1");
                            cible.lastChild.nodeValue = " ▼";
                        }

                        //TRI DES DATAS
                        DATA.body.sort(function (a, b)
                        {
                            if (a[position] > b[position])
                                return (sens < 0 ? 1 : -1);
                            if (a[position] < b[position])
                                return (sens < 0 ? -1 : 1);

                            //EN CAS D'ÉGALITÉ
                            return 0;
                        });

                        //AFFICHAGE DES DATAS TRIÉES
                        _redraw();
                    }, true);
                    thCell.style.cursor = "pointer";
                    thCell.appendChild(sortText);
                }

                TR.appendChild(thCell);
            }
        }

        if ((TABLE.ADDL.on || TABLE.UPDL.on || TABLE.DELL.on || TABLE.ADDL.before || TABLE.UPDL.before || TABLE.DELL.before) && TABLE.ROWS > 0) {
            var thAct = document.createElement("th");
            thAct.innerHTML = "Actions";
            thAct.className = "dyntab-actions"

            TR.appendChild(thAct);
        }

        TabHTML.tHead.appendChild(TR);

        //POUR PLUS TARD ;-)
        //TabHTML.createTBody()
        //TabHTML.tBodies[0].appendChild(...);

        //CORPS DU TABLEAU
        var tBody = document.createElement("tbody");

        for (var i = 0; i < TABLE.ROWS; i++) {
            ////PAGINATION
            ////SI ON DÉPASSE LA TAILLE DE LA PAGINATION ON AFFICHE PAS LES LIGNES SUIVANTES
            //if (i >= TABLE.PAGIN)
            //    tr.style.display = "none";

            var tr = _createLine(DATA.body[i]);
            tr.className = (i % 2 === 0 ? "dyntab-paire" : "dyntab-impaire");
            tBody.appendChild(tr);
        }

        ////PAGINATION
        //tBody.appendChild(_getPagination());

        TabHTML.appendChild(tBody);

        _getButtonPlus(TabHTML);

        return TabHTML;
    };

    /*REDESSINE LE CORPS TABLEAU
    */
    var _redraw = function ()
    {
        //ON REDESSINE LE CORPS DU TABLEAU POUR L'INSTANT
        document.getElementById(TABLE.ID).removeChild(document.getElementById(TABLE.ID).lastChild);
        document.getElementById(TABLE.ID).appendChild(_draw().lastChild);

        //TABLEAU AFFICHÉ
        Rendered(document.getElementById(TABLE.ID));
    }

    /*RETOURNE LES BOUTONS NÉCESSAIRES POUR UNE LIGNE
    * @returns {Element} : td contenant les boutons
    */
    var _getButtons = function ()
    {
        if (TABLE.ADDL.on || TABLE.UPDL.on || TABLE.DELL.on || TABLE.ADDL.before || TABLE.UPDL.before || TABLE.DELL.before) {

            var td = document.createElement("td");
            td.className = "dyntab-alter";

            //AJOUT D'UNE LIGNE
            if (TABLE.ADDL.on || TABLE.ADDL.before) {
                var button = document.createElement("button");
                button.innerHTML = "+";
                button.title = "Ajouter une ligne au-dessus"
                button.addEventListener("click", function (e)
                {
                    //EMPÊCHE L'ÉVENEMENT DE REMONTER ET DE DÉCLENCHER ONLINECLICK
                    e.stopPropagation();
                    //SI UNE LIGNE EST DÉJÀ EN ÉDITION, ON EMPÊCHE LA MULTI CRÉATION/ÉDITION
                    if (EVENT.LineAdding || EVENT.LineEditing) {
                        alert("Une ligne est déjà en édition.\nVeuillez la valider avant de modifier ou d'ajouter une nouvelle ligne.");
                        return;
                    }

                    //CRÉATION DE LA NOUVELLE LIGNE
                    var elt = LineAdd(e);
                    //ÉVENEMENT INTRINSÈQUE
                    EVENT.LineAdding = true;
                    //ÉVENEMENT PERSONNALISÉ EN DERNIER
                    EVENT.LineAdd && EVENT.LineAdd(e, elt);
                });
                td.appendChild(button)
            }

            //MODIFICATION D'UNE LIGNE
            if (TABLE.UPDL.on || TABLE.UPDL.before) {
                var button = document.createElement("button");
                button.innerHTML = "&#x270D;";
                button.title = "Modifier cette ligne";
                button.addEventListener("click", function (e)
                {
                    //EMPÊCHE L'ÉVENEMENT DE REMONTER ET DE DÉCLENCHER ONLINECLICK
                    e.stopPropagation();
                    //SI UNE LIGNE EST DÉJÀ EN ÉDITION, ON EMPÊCHE LA MULTI CRÉATION/ÉDITION
                    if (EVENT.LineAdding || EVENT.LineEditing) {
                        alert("Une ligne est déjà en édition.\nVeuillez la valider avant de modifier ou d'ajouter une nouvelle ligne.");
                        return;
                    }

                    //MODIFICATION DE LA LIGNE
                    var elt = LineUpd(e);
                    //ÉVENEMENT INTRINSÈQUE
                    EVENT.LineEditing = true;
                    //ÉVENEMENT PERSONNALISÉ EN DERNIER
                    EVENT.LineEdit && EVENT.LineEdit(e, elt);
                });
                td.appendChild(button)
            }

            //SUPRESSION D'UNE LIGNE
            if (TABLE.DELL.on || TABLE.DELL.before) {
                var button = document.createElement("button");
                button.innerHTML = "-";
                button.title = "Supprimer cette ligne";
                button.addEventListener("click", function (e)
                {
                    //EMPÊCHE L'ÉVENEMENT DE REMONTER ET DE DÉCLENCHER ONLINECLICK
                    e.stopPropagation();
                    //SUPPRESSION DE LA LIGNE
                    var elt = LineDel(e);
                    //ÉVENEMENT INTRINSÈQUE
                    EVENT.LineDeleted = true;
                    //ÉVENEMENT PERSONNALISÉ EN DERNIER
                    EVENT.LineDelete && EVENT.LineDelete(e, elt);
                });
                td.appendChild(button)
            }
            return td;
        }
    };

    /*RESTITUE LE TABLEAU EN HTML À L'ID INDIQUÉ
    * @param {String} id : identifiant de la balise html où placer le tableau
    */
    this.getTableTo = function (id)
    {
        CIBLE = document.getElementById(id);
        if (CIBLE) {
            CIBLE.appendChild(_draw());

            TABLE.ISINIT = true;

            //TABLEAU AFFICHÉ
            Rendered(document.getElementById(TABLE.ID));
        }
        else {
            console.log("identifiant '" + id + "' introuvable");
        }
    };

    /*RESTITUE LE TABLEAU EN HTML
    * @returns {Element}
    */
    this.getTable = function ()
    {
        var ret;

        if (TABLE.ISINIT)
            ret = document.getElementById(CIBLE);
        else
            ret = _draw();

        return ret;
    };

    /*retourne le jeu de données utilisé par l'instance
    * @returns {Object}
    */
    this.getData = function ()
    {
        return DATA;
    };

    /*RETOURNE L'ÉLÉMENT HTML CORRESPONDANT AU PRAMÈTRE
    * @param {String} descr : le type de champs
    * @param {Element} node : l'élément
    * @returns {Element} : élément HTML
    */
    var _getElement = function (descr, node)
    {
        var elt;

        switch (descr.toLocaleLowerCase()) {
            case "text":
                elt = document.createElement("input");
                elt.setAttribute("type", "text");
                elt.value = _getVal(node);
                break;
            case "descr":
                elt = document.createElement("textarea");
                elt.style.width = "100%";
                elt.value = _getVal(node);
                break;
            case "bool":
                elt = document.createElement("input");
                elt.setAttribute("type", "checkbox");
                elt.checked = _getVal(node);
                break;
            case "ddl":
                elt = document.createElement("select");
                //SI ON TROUVE UN SELECT ON LE GARDE TEL QU'IL EST
                if (node) {
                    elt = node.firstChild;
                    elt.disabled = false;
                }
                break;
            case "html":
                if (node && node.firstChild) {
                    elt = node.firstChild.cloneNode(true);
                }
                else {
                    elt = document.createTextNode("");
                }

                //elt = (node ? (node.firstChild ? node.firstChild.cloneNode(true) : node.cloneNode(true)) : document.createTextNode(""));
                break;
            default:
                elt = document.createElement("input");
                elt.setAttribute("type", "text");
                elt.value = _getVal(node);
                break;
        }

        return elt;
    };

    /*RÉCUPÈRE LA VALEUR D'UN ÉLÉMENT PASSÉ EN PARAMÈTRE
    * @param {Element} node
    * @returns {String/Bool}
    */
    var _getVal = function (node)
    {
        var ret = "";

        //SI QQCH EST PASSÉ À LA FONCTION
        if (node) {
            //SI IL CONTIENT UN NOEUD
            if (node.firstChild) {
                //SI IL CONTIENT UN NOEUD DE TEXTE, ON RÉCUPÈRE SON INNERHTML
                if (node.firstChild.nodeType === 3)
                    ret = node.innerHTML;
                else {
                    //SI LE NOEUD CONTIENT UN ENFANT DE TYPE ÉLÉMENT
                    if (node.firstChild.nodeType === 1) {
                        switch (node.firstChild.tagName.toLocaleLowerCase()) {
                            case "input":
                                //DÉTECTION DU TYPE DE L'INPUT
                                switch (node.firstChild.getAttribute("type")) {
                                    case "text":
                                        ret = node.firstChild.value;
                                        break;
                                    case "checkbox":
                                        ret = node.firstChild.checked;
                                        break;
                                }
                                break;
                            case "textarea":
                                ret = node.firstChild.value;
                                break;
                            case "select":
                                ret = node.firstChild.children[node.firstChild.selectedIndex].value;
                                break;
                        }
                    }
                }
            }
        }
        return ret;
    };

    /*CRÉÉ UNE LISTE DÉROULANTE
    * @param {Number} ind : l'indice de la colonne où se trouve la ddl
    * @param {String} (optional) defVal : la valeur séléctionnée
    * @returns {Element}
    */
    var _getDdl = function (ind, defVal)
    {
        if (DATA.values[ind] === undefined)
            throw "Wrong parameter 'ind'";

        var ddl = _getElement("ddl"),
            opt = _getOpt(ind, defVal);

        for (var i = 0; i < opt.length; i++)
            ddl.appendChild(opt[i]);

        return ddl;
    };

    /*CRÉÉ LES ÉLÉMENTS OPTIONS CORRESPONDANTS À L'INDICE DE LA DDL
    * @param {Number} ind : position de la ddl corespondante
    * @param {String} defVal : valeur sélectionnée
    * @returns {Array} : contient les éléments option
    */
    var _getOpt = function (ind, defVal)
    {
        if (DATA.values[ind] === undefined)
            throw "Wrong parameter 'ind'";

        var tabRet = [];

        for (var i = 0; i < DATA.values[ind].length; i++) {
            var elm = document.createElement("option");

            for (var obj in DATA.values[ind][i]) {
                elm.value = obj;
                elm.appendChild(document.createTextNode(DATA.values[ind][i][obj]));

                if (defVal === obj)
                    elm.selected = true;
            }

            tabRet.push(elm);
        }
        return tabRet;
    };

    /*CRÉÉ LA DERNIÈRE LIGNE DE PAGINATION
    * @returns {Element}
    */
    var _getPagination = function ()
    {
        var trPage = document.createElement("tr"),
            tdPage = document.createElement("td"),
            spanMoveFirst = document.createElement("span"),
            spanMovePrev = document.createElement("span"),
            spanMoveNext = document.createElement("span"),
            spanMoveLast = document.createElement("span");

        spanMoveFirst.innerHTML = "&laquo;";
        spanMovePrev.innerHTML = "&lsaquo;";
        spanMoveNext.innerHTML = "&rsaquo;";
        spanMoveLast.innerHTML = "&raquo;";

        tdPage.colSpan = TABLE.COLS + (TABLE.ADDL.on || TABLE.UPDL.on || TABLE.DELL.on || TABLE.ADDL.before || TABLE.UPDL.before || TABLE.DELL.before ? 1 : 0);
        tdPage.align = "center";

        tdPage.appendChild(spanMoveFirst);
        tdPage.appendChild(document.createTextNode(" "));
        tdPage.appendChild(spanMovePrev);
        tdPage.appendChild(document.createTextNode(" " + Math.ceil(TABLE.ROWS / TABLE.PAGIN) + " pages  de " + TABLE.PAGIN + " lignes"));
        tdPage.appendChild(spanMoveNext);
        tdPage.appendChild(document.createTextNode(" "));
        tdPage.appendChild(spanMoveLast);

        tdPage.title = "En Dev";

        trPage.appendChild(tdPage);
        return trPage;
    };

    /*RETOURNE UNE CHAINE DE CARACTÈRES ALÉATOIRE BASÉE SUR UN CHIFFRE ALÉATOIRE ET LA DATE
    * @param {Bool} (Optionnal) Default : identifiant de ligne par défaut
    * @return {String}
    */
    var _getId = function (Default)
    {
        if (Default !== undefined)
            return "T" + _selfObj.id + "line" + Math.random().toString().split(".")[1];

        return Math.random().toString().split(".")[1] + new Date().getTime();
    };

    /*AJOUTE UNE LIGNE SUPPLÉMENTAIRE POUR AJOUTER LA PREMIÈRE LIGNE
    * @param {Element} table : le tableau
    */
    var _getButtonPlus = function (table)
    {
        //SI PAS DE LIGNE ET QUE L'AJOUT EST PERMIS
        if ((TABLE.ADDL.on || TABLE.ADDL.before) && TABLE.ROWS === 0) {
            //AJOUT DE L'ENTÊTE ACTIONS SI IL N'EST PAS DÉJÀ PRÉSENT
            if (table.tHead.firstChild.children.length === TABLE.COLS) {
                var thPlus = document.createElement("th");
                thPlus.innerHTML = "Actions"
                thPlus.classList.add("dyntab-actions");
                table.tHead.firstChild.appendChild(thPlus);
            }

            //ON AJOUTE UN BOUTON D'AJOUT DE LIGNE
            var trPlus = document.createElement("tr"),
                tdPlus = document.createElement("td"),
                tdAct = document.createElement("td"),
                button = document.createElement("button");

            button.innerHTML = "+";
            button.title = "Ajouter une ligne au-dessus"
            button.addEventListener("click", function (e)
            {
                //EMPÊCHE L'ÉVENEMENT DE REMONTER ET DE DÉCLENCHER ONLINECLICK
                e.stopPropagation();
                //CRÉATION DE LA NOUVELLE LIGNE
                var elt = LineAdd(e);
                //ÉVENEMENT INTRINSÈQUE
                EVENT.LineAdding = true;
                //ÉVENEMENT PERSONNALISÉ EN DERNIER
                EVENT.LineAdd && EVENT.LineAdd(e, elt);
                //SUPPRESSION DE LA LIGNE
                table.tBodies[0].removeChild(e.target.parentElement.parentElement);
            });

            tdPlus.setAttribute("colspan", TABLE.COLS);
            tdPlus.appendChild(document.createTextNode(""));

            tdAct.appendChild(button);

            trPlus.appendChild(tdPlus);
            trPlus.appendChild(tdAct);
            table.tBodies[0].appendChild(trPlus);
        }
    };

    /*VÉRIFIE SI LA LIGNE CORRESPOND AUX MODÈLE DE DONNÉES
    * @param {Array} line : la ligne à vérifier
    * @returns {Bool}
    */
    var _isCorrectLine = function (line)
    {
        if (line === undefined)
            return false;
        //console.log("définie OK");

        if (!Array.isArray(line))
            return false;
        //console.log("tableau OK");

        //ON VÉRIFIE LA TAILLE DE LA LIGNE
        if (line.length !== TABLE.COLS && line.length !== (TABLE.COLS + 1))
            return false;
        //console.log("taille OK");

        //ON COMPARE LES TYPES DE CHAQUE COLONNE AVEC LES DATATYPE ATTENDUES
        for (var i = 0; i < DATA.dataType.length; i++) {
            switch (DATA.dataType[i]) {
                //SI C'EST UNE CHECKBOX
                case "bool":
                    //console.log("Bool");
                    if (isNaN(parseInt(line[i], 10)) || (parseInt(line[i], 10) !== 1 && parseInt(line[i], 10) !== 0))
                        return false;
                    break;
                    //SI C'EST UNE DDL
                case "ddl":
                    //console.log("DDL");
                    var trouve = false;

                    top:
                        for (var j = 0; j < DATA.values[i].length; j++)
                            for (var k in DATA.values[i][j])
                                if (DATA.values[i][j][k] === line[i]) {
                                    trouve = true;
                                    break top;
                                }

                    return trouve;
                    break;
                    //SI IL S'AGIT DES CHAMPS HABITUEL
                case "text":
                case "descr":
                case "lineId":
                    //console.log("text/descr/lineId");
                    var typeElt = typeof line[i];

                    //SI CE N'EST PAS UNE STRING NI UN NOMBRE
                    if (typeElt !== "string" && typeElt !== "number")
                        return false;
                    break;
                case "html":
                    //console.log("html");
                    var typeEltObj = Object.prototype.toString.call(line[i]),
                        typeElt = typeof line[i];

                    //SI CE N'EST PAS UN OBJET HTML
                    if (!/HTML/g.test(typeEltObj) && typeElt === "object")
                        return false;
                    //SI CE N'EST PAS UNE STRING NI UN NOMBRE
                    if (typeElt !== "string" && typeElt !== "number")
                        return false;
                    break;
                    //SI CE N'EST AUCUNE DES CAS NORMAUX
                default:
                    //console.log("erreur de type");
                    return false;
                    break;
            }
        }
        return true;
    };

    /*CRÉÉ UNE LIGNE À PARTIR DES DONNÉES
    * @param {Array} dataLine
    * @returns {Element}
    */
    var _createLine = function (dataLine)
    {
        if (!dataLine)
            throw "Argument null";

        if (!Array.isArray(dataLine))
            throw "Argument is not an Array";

        var tr = document.createElement("tr");

        for (var i = 0; i < dataLine.length; i++) {
            var td = document.createElement("td");

            switch (DATA.dataType[i]) {
                case "text":
                case "descr":
                    td.appendChild(document.createTextNode(dataLine[i] || ""));
                    break;
                case "bool":
                    var chkbx = _getElement("bool");
                    chkbx.checked = !!dataLine[i];
                    chkbx.disabled = true;
                    td.appendChild(chkbx);
                    td.align = "center";
                    break;
                case "ddl":
                    var ddl = _getDdl(i, dataLine[i]);
                    ddl.disabled = true;

                    td.appendChild(ddl);
                    break;
                case "lineId":
                    //L'IDENTIFIANT DE LA LIGNE
                    tr.id = dataLine[i];
                    break;
                case "html":
                    switch (typeof dataLine[i]) {
                        case "string":
                            td.innerHTML = dataLine[i];
                            break;
                        case "object":
                            td.appendChild(dataLine[i]);
                            break;
                        default:
                            td.appendChild(document.createTextNode(dataLine[i] || ""));
                    }
                    break;
                default:
                    td.appendChild(document.createTextNode(dataLine[i] || ""));
                    break;
            }
            //ON AJOUTE UNE CELLULE UNIQUEMENT SI CE N'EST PAS UNE LINEID
            if (DATA.dataType[i] !== "lineId")
                tr.appendChild(td);
        }

        //AJOUT DES BOUTONS
        if (TABLE.ADDL.on || TABLE.UPDL.on || TABLE.DELL.on || TABLE.ADDL.before || TABLE.UPDL.before || TABLE.DELL.before)
            tr.appendChild(_getButtons());

        //AJOUT DU CLICK SUR LA LIGNE
        if (TABLE.CLIL)
            tr.addEventListener("click", function (e)
            {
                var cible = e.target;

                while (cible.tagName !== "TR") {
                    cible = cible.parentElement;
                }

                EVENT.LineClick && EVENT.LineClick(e, cible);
            }, false);

        return tr;
    };

    /*
    * @CTOR
    */
    //GÉNÉRATION DE L'ID DE L'OBJET
    _selfObj.id = _getId();
    //ET DE L'ÉLÉMENT HTML
    TABLE.ID += _selfObj.id;

    if (objet)
        this.setData(objet);
}