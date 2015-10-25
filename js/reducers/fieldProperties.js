import {
  SELECT_FIELD_PROPERTY,
  SELECT_FIELD_PROPERTY_VALUE,
  REQUEST_FIELD_PROPERTIES,
  RECEIVE_FIELD_PROPERTIES
} from '../constants/ActionTypes';

export default function fieldProperties(state={
  isFetching: false,
  loaded: false,
  items: [],
  updatedAt: 0
}, action) {
  const AGGREGATIONS = [
    {
      value: "ALL_TYPES",
      label: "All Types",
      selected: true
    },
    {
      value: "AVG",
      label: "mean",
      selected: false
    },
    {
      value: "MIN",
      label: "min",
      selected: false
    },
    {
      value: "MAX",
      label: "max",
      selected: false
    }
  ];

  switch (action.type) {
    case SELECT_FIELD_PROPERTY:
      var { items } = state;

      const newSelectedIndex = state.items.findIndex((property, i, props) =>
        property.id == action.selectedFieldPropertyId
      );

      if (newSelectedIndex >= 0) {
        items[newSelectedIndex].selected = !items[newSelectedIndex].selected;
      }

      return { ...state, items: items, updatedAt: action.receivedAt };

    case SELECT_FIELD_PROPERTY_VALUE:
      var items = state.items.slice();

      const selectedFieldPropertyIndex = items.findIndex((property) =>
        property.id == action.selectedFieldPropertyId
      );

      if (selectedFieldPropertyIndex >= 0) {
        items[selectedFieldPropertyIndex].splitMenu = items[selectedFieldPropertyIndex].splitMenu.map((propertyValue) =>
          new Object({
            label: propertyValue.label,
            value: propertyValue.value,
            selected: propertyValue.value == action.selectedFieldPropertyValueId
          })
        );
      }

      return { ...state, items: items, updatedAt: Date.now() };

    case REQUEST_FIELD_PROPERTIES:
      return { ...state, isFetching: true };

    case RECEIVE_FIELD_PROPERTIES:
      var aggregations = AGGREGATIONS.slice();

      const allValuesMenuItem = {
        selected: true,
        value: "ALL_VALUES",
        label: "All Values"
      };

      var items = action.fieldProperties.map((property) =>
        new Object({
          ...property,
          selected: false,
          splitMenu: (property.generalType == 'q') ? aggregations : [allValuesMenuItem, ...property.uniqueValues.map((value, i) =>
            new Object({
              selected: false,
              value: `${ value }`,
              label: value
            })
          )]
        })
      );
      return { ...state, isFetching: false, items: items, updatedAt: action.receivedAt };

    default:
      return state;
  }
}
