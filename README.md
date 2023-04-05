# Brushless-painter

Dessinez dans votre navigateur web en utilisant l'index de la main à l'aide de votre caméra.
La détection se fait grâce à l'API Javascript de Mediapipe pour la détection de mains, qui utilise des algorithmes 
d'apprentissage automatique. Le modèle utilisé est celui fourni par Mediapipe, qui a été entrainé sur plus de 30k images.

## Contexte

Ce projet est réalisé par deux étudiants à l'université de Bourgogne, en troisième année de licence science pour l'ingénieur parcours électronique. Il est soumis à une note et sera présenté à un jury lors d'une soutenance.

## Démo

![demo](https://user-images.githubusercontent.com/110404104/229896766-30cfb4c3-0fe8-4eb6-901f-79d10e8edfd7.png)

# Version

Nous considérons que la version 1.0 correspond à l'état du projet cloturé par la date de soutenance (03 mai 2023). 
 
# Fonctionnalités

A ce jour, les fonctionnalités disponibles sont:
 - Dessiner avec l'index à l'écran. L'épaisseur du trait est proportionnelle à l'inclinaison de la main.
 - Sélection de couleur dans une palette.
 - Gommer / Effacer l'écran.
 - Click avec l'index.

# Télécharger le projet

Commencez par cloner le projet en téléchargeant depuis la page github ou par la commande:

```
cd chemin_de_destination/
git clone https://github.com/GehuL/brushless-painter.git
```

## Avec CDN (simple)

La version avec CDN (content delivery network) charge les scripts de médiapipe et tout le nécessaire depuis leurs serveurs.
Il est donc nécessaire d'avoir une connexion internet pour faire fonctionner la détection de main.

## Sans CDN

Pour installer les modules de Mediapipe sur votre machine, il faut installer l'utilitaire de package javascript [nmp](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Une fois npm installé, déplacez-vous à la racine du projet et tapez:
```
cd frontend/
npm i @mediapipe/camera_utils
npm i @mediapipe/drawing_utils
npm i @mediapipe/control_utils
npm i @mediapipe/hands
```

## Executer

Pour pouvoir exécuter le programme dans le navigateur, il est impératif de lancer un serveur car des erreurs qui bloquent le chargement de script peuvent apparaître.

Tout d'abord, installez la version 3 de [python](https://www.python.org/downloads/).
Ensuite, tapez les commandes suivantes:
```
cd frontend/
python3 -m http.server 8765
```

Un serveur en local démarre, vous pouvez ensuite tapez dans la barre de recherche de votre navigateur:
http://localhost:8765/homepage.html

La valeur 8765 étant le port du serveur, vous pouvez la changer si ce port est déjà occupé.

# Compatibilité

La compatibilité repose essentiellement sur les systèmes et navigateur supportés par la librairie Mediapipe.

Les navigateurs et systèmes d'exploitation testés sont les suivants:

|         OS          |     Chrome      |     Safari     |    Firefox    | 
| ------------------  | --------------  | -------------  | ------------- |
| MacOS (High Sierra) |       V         |       X        |      ?        |
| Windows NT (10/11)  |       V         |       ?        |      ?        |
| Raspberry PI        |       ?         |       ?        |      X        | 

<br> Légende: </br> 

 - X : Ne fonctionne pas
 - V : Fonctionne
 - ? : Non tester

# A-venir

# Liens externes

[Mediapipe documentation](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
