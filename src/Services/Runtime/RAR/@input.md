```json
//global inputs are defined in engine code - this file is used to bind actions to inputs, which can be used in widgets
{
  "Keyboard_E": {
    "onPress":[{"@input":"<inputAction1>", "active":true}],
    "onRelease":[{"@input":"<inputAction2>", "active":true}],
    "onHold":[{"@input":"<inputAction3>", "active":true}],
  },
  "Gamepad_Button_X": [{"@input":"<inputAction4>", "active":true}], //active helps to disable/enable certain actions
  
  "Mouse_Left": [{"@input":"<inputAction5>", "active":true}], //will trigger for all allowed types - onPress, onRelease, onHold
}
```