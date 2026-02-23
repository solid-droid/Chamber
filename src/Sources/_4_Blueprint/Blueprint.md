## ECS blueprint

### Entity Structure
```json
[
    {
        "@instance":{ 
            //added by @bind or auto generated
            "Ref":"", 
            "options":{}
        },
        "@meta":{ 
            //info and ref of the components/ can be used for searching and AI
            "Ref":"@Custom/buttons/myButton",
            "options": {},
        },
        "@design": [
            {
                "Ref":"@defaults/ButtonPrimary",
                "options":{}
            } 
        ],
        "@state": {
            //all states are registered in store (can be accessed globally using the ref - @Custom/buttons/myButton)
            "disabled":{"type":"boolean", "value":false},
        },
        "@bind":"button_primary_handle",
        //@bind is responsible for binding and placing the design elements.
        //@bind is called when entity is added in parent entity, initializing events and states 
        "@event": {
            //event handle on myButton
            "click": "button_click_handle",
            "Hover": "button_hover_handle"
        }

        //@state and @event triggers can be accessed using Ref
    },
]
```