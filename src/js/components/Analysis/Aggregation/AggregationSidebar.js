import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getNewQueryString } from '../../../helpers/helpers';

import { fetchFieldPropertiesIfNeeded } from '../../../actions/FieldPropertiesActions';
import { selectBinningConfigX, selectBinningConfigY, selectAggregationIndependentVariable, selectAggregationVariable, selectAggregationFunction, selectAggregationWeightVariable, selectConditional } from '../../../actions/AggregationActions';
import styles from '../Analysis.sass';

import ConditionalSelector from '../../Base/ConditionalSelector';
import Sidebar from '../../Base/Sidebar';
import SidebarGroup from '../../Base/SidebarGroup';
import ToggleButtonGroup from '../../Base/ToggleButtonGroup';
import DropDownMenu from '../../Base/DropDownMenu';
import BinningSelector from '../../Visualizations/SingleVisualization/BinningSelector';

export class AggregationSidebar extends Component {
  componentWillMount(props) {
    const { project, datasetSelector, fieldProperties, fetchFieldPropertiesIfNeeded } = this.props;

    if (project.id && datasetSelector.datasetId && !fieldProperties.items.length && !fieldProperties.fetching) {
      fetchFieldPropertiesIfNeeded(project.id, datasetSelector.datasetId)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { project, datasetSelector, fieldProperties, fetchFieldPropertiesIfNeeded } = nextProps;
    const datasetIdChanged = datasetSelector.datasetId != this.props.datasetSelector.datasetId;

    if (project.id && datasetSelector.datasetId && (datasetIdChanged || !fieldProperties.loaded) && !fieldProperties.fetching) {
      fetchFieldPropertiesIfNeeded(project.id, datasetSelector.datasetId)
    }
  }

  clickQueryStringTrackedItem = (key, value) => {
    const { project, datasetSelector, push, queryObject } = this.props;
    const newQueryString = getNewQueryString(queryObject, key, value, true);
    push(`/projects/${ project.id }/datasets/${ datasetSelector.datasetId }/analyze/aggregation${ newQueryString }`);
  }

  render() {
    const { fieldProperties, aggregationSelector, selectAggregationIndependentVariable, selectBinningConfigX, selectBinningConfigY, conditionals, selectConditional, aggregationVariablesIds, aggregationVariableId } = this.props;

    const nonAggregationVariables = fieldProperties.items.filter((item) => aggregationVariablesIds.indexOf(item.id) < 0)
    const aggregationOptions = [{'id': 'count', 'name' : 'count'}, ...nonAggregationVariables.filter((item) => item.generalType == 'q')]
    const numAggregationVariables = fieldProperties.items.filter((item) => item.generalType == 'q' && aggregationVariablesIds.indexOf(item.id) >= 0 )
    const n_q = numAggregationVariables.length;

    return (
      <Sidebar>
        { this.props.fieldProperties.items.length != 0 &&
          <SidebarGroup heading="Aggregation Variables">
            { fieldProperties.items.filter((property) => property.generalType == 'c').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Categorical</div>
                <ToggleButtonGroup
                  toggleItems={ fieldProperties.items.filter((property) => property.generalType == 'c').map((item) =>
                    new Object({
                      id: item.id,
                      name: item.name,
                      disabled: (item.id == aggregationVariableId) || item.isId,
                      color: item.color
                    })
                  )}
                  displayTextMember="name"
                  valueMember="id"
                  colorMember="color"
                  externalSelectedItems={ aggregationVariablesIds }
                  separated={ true }
                  onChange={ (v) => this.clickQueryStringTrackedItem('aggregationVariablesIds', parseInt(v)) } />
              </div>
            }
            { fieldProperties.items.filter((property) => property.generalType == 't').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Temporal</div>
                <ToggleButtonGroup
                  toggleItems={ fieldProperties.items.filter((property) => property.generalType == 't').map((item) =>
                    new Object({
                      id: item.id,
                      name: item.name,
                      disabled: (item.id == aggregationVariableId),
                      color: item.color
                    })
                  )}
                  valueMember="id"
                  colorMember="color"
                  displayTextMember="name"
                  externalSelectedItems={ aggregationVariablesIds }
                  separated={ true }
                  onChange={ (v) => this.clickQueryStringTrackedItem('aggregationVariablesIds', parseInt(v)) } />
              </div>
            }
            { fieldProperties.items.filter((property) => property.generalType == 'q').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Quantitative</div>
                <ToggleButtonGroup
                  toggleItems={ fieldProperties.items.filter((property) => property.generalType == 'q').map((item) =>
                    new Object({
                      id: item.id,
                      name: item.name,
                      disabled: (item.id == aggregationVariableId) || item.isId,
                      color: item.color
                    })
                  )}
                  valueMember="id"
                  colorMember="color"
                  displayTextMember="name"
                  externalSelectedItems={ aggregationVariablesIds }
                  separated={ true }
                  onChange={ (v) => this.clickQueryStringTrackedItem('aggregationVariablesIds', parseInt(v)) } />
              </div>
            }
          </SidebarGroup>
        }
        { this.props.fieldProperties.items.length != 0 &&
          <SidebarGroup heading="Aggregate on">
            <DropDownMenu
              value={ aggregationVariableId }
              options= {aggregationOptions}
              valueMember="id"
              displayTextMember="name"
              onChange={ this.props.selectAggregationVariable }/>
          </SidebarGroup>
        }
        { aggregationVariableId != 'count' &&
          <SidebarGroup heading="By">
            <DropDownMenu
              value={ this.props.aggregationSelector.aggregationFunction}
              options={ [{ 'id':'SUM', 'name':'sum' }, { 'id':'MEAN', 'name':'mean' }] }
              valueMember="id"
              displayTextMember="name"
              onChange={ this.props.selectAggregationFunction }/>
          </SidebarGroup>
        }
        { this.props.aggregationSelector.aggregationFunction == 'MEAN' && aggregationVariableId != 'count' &&
          <SidebarGroup heading="Weighted by:">
            <DropDownMenu
              value={ this.props.aggregationSelector.weightVariableId}
              options={ [{ 'id':'UNIFORM', 'name':'uniform' }, ...this.props.fieldProperties.items.filter((item) => item.generalType == 'q')] }
              valueMember="id"
              displayTextMember="name"
              onChange={ this.props.selectAggregationWeightVariable }/>
          </SidebarGroup>
        }
        { n_q >= 1 &&
          <BinningSelector
            config={ this.props.aggregationSelector.binningConfigX }
            selectBinningConfig={ selectBinningConfigX }
            name={ numAggregationVariables[0].name }/>
        }
        { n_q == 2 &&
          <BinningSelector
            config={ this.props.aggregationSelector.binningConfigY }
            selectBinningConfig={ selectBinningConfigY }
            name={ numAggregationVariables[1].name }/>
        }
        { fieldProperties.items.length != 0 && conditionals.items.length != 0 &&
          <SidebarGroup heading="Filter by field">
            { conditionals.items.map((conditional, i) =>
              <div key={ `conditional-selector-${ i }` }>
                <ConditionalSelector
                  fieldId={ conditional.fieldId }
                  combinator={ conditional.combinator }
                  operator={ conditional.operator }
                  value={ conditional.value }
                  conditionalIndex={ i }
                  fieldProperties={ fieldProperties.items }
                  selectConditionalValue={ selectConditional }/>
              </div>
            )}
          </SidebarGroup>
        }
      </Sidebar>
    );
  }
}

AggregationSidebar.propTypes = {
  project: PropTypes.object.isRequired,
  datasetSelector: PropTypes.object.isRequired,
  fieldProperties: PropTypes.object.isRequired,
  aggregationSelector: PropTypes.object.isRequired,
  conditionals: PropTypes.object,
  queryObject: PropTypes.object.isRequired,
  aggregationVariablesIds: PropTypes.array.isRequired,
  aggregationVariablesId: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  const { project, conditionals, datasetSelector, fieldProperties, aggregationSelector } = state;
  return {
    project,
    datasetSelector,
    fieldProperties,
    aggregationSelector,
    conditionals
  };
}

export default connect(mapStateToProps, { fetchFieldPropertiesIfNeeded, selectBinningConfigX, selectBinningConfigY, selectAggregationIndependentVariable, selectAggregationVariable, selectAggregationFunction, selectAggregationWeightVariable, selectConditional, push })(AggregationSidebar);
