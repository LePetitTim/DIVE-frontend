import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import DocumentTitle from 'react-document-title';

import { Button, Intent } from '@blueprintjs/core';

import { fetchPreloadedDatasets, selectPreloadedDataset } from '../../actions/PreloadedDatasetActions';
import { chunk } from '../../helpers/helpers';
import datasetsStyles from './Datasets.sass';
import preloadedDatasetsStyles from './PreloadedDatasets.sass';
const styles = {
  ...datasetsStyles,
  ...preloadedDatasetsStyles
}

import Dropzone from 'react-dropzone';
import Loader from '../Base/Loader';
import HeaderBar from '../Base/HeaderBar';

export class DatasetPreloadedPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
        searchQuery: ''
    };
  }

  componentWillMount() {
    const { project, preloadedDatasets, fetchPreloadedDatasets } = this.props;

    if (project.id && !preloadedDatasets.fetchedAll && !preloadedDatasets.isFetching) {
      fetchPreloadedDatasets();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { project, preloadedDatasets, fetchPreloadedDatasets } = nextProps;
    // if (datasetSelector.datasetId != this.props.datasetSelector.datasetId) {
    //   push(`/projects/${ params.projectId }/datasets/${ datasetSelector.datasetId }/inspect`);
    // }

    if (project.id && !preloadedDatasets.fetchedAll && !preloadedDatasets.isFetching) {
      fetchPreloadedDatasets();
    }
  }

  render() {
    const { project, preloadedDatasets, selectPreloadedDataset } = this.props;

    const rows = chunk(preloadedDatasets.items, 3)

    return (
      <DocumentTitle title={ 'Preloaded' + ( project.title ? ` | ${ project.title }` : '' ) }>
        <div className={ styles.fillContainer + ' ' + styles.preloadedDatasetsContainer }>
          <div className={ styles.headerControlRow + ' ' + styles.datasetSearch }>
            <div className='pt-input-group'>
              <span className='pt-icon pt-icon-search' />
              <input
                className='pt-input'
                type="search"
                placeholder="search..."
              />
            </div>
          </div>
          { rows.map((row) =>
            <div className= { styles.row }>
              { row.map((d) =>
                <div
                  key={ d.id }
                  className={
                    'pt-card pt-interactive ' +
                    styles.selectButton + ' ' +
                    styles.preloadedDataset
                  }
                >
                  <h5>{ d.title }</h5>
                  <p>{ d.description }</p>
                  <Button
                    className={ styles.selectButton }
                    text="Select"
                    onClick={ () => selectPreloadedDataset(project.id, d.id) }
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state) {
  const { project, preloadedDatasets } = state;
  return { project, preloadedDatasets };
}

export default connect(mapStateToProps, {
  fetchPreloadedDatasets,
  selectPreloadedDataset,
  push
})(DatasetPreloadedPage);
