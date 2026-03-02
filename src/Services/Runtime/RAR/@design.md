```json
{
    "Category":"DOM",
    "Type":"html+css", //this is just default/root type. they can use other types also
    //DOM - html+css, SVG
    //3D - Model, Procedural, Bones, Material, Shader
    //2D - Image , Sprite Sheet , Bones, Material, Shader
    //AUDIO - Synth
    //Animate - Timeline , IK, Event Drive

    "@imports":[
        {"src":"filelocation2" }
    ],
    "@scripts":[
        {"src":"filelocation1", "root":true }
        {"src":"filelocation3"}
    ]
}

```