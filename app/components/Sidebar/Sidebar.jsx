import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import styles from './Sidebar.scss';

// import minimizeImg from '../../../resources/img/button minimize.png';

export default class Sidebar extends Component {
  handleClick = e => {
    const { action } = e.currentTarget.dataset;
    ipcRenderer.send('app:' + action);
  };

  render() {
    return (
      <header className={styles.container}>
        <div className={styles.buttonsContainer}>
          <div
            onClick={this.handleClick}
            data-action="minimize"
            className={[styles.icon, styles.minimize].join(' ')}
          >
            <img src={minimizeImg} />
          </div>
          <div
            onClick={this.handleClick}
            data-action="maximize"
            className={[styles.icon, styles.maximize].join(' ')}
          >
            <img src={maximizeImg} />
          </div>
          <div
            onClick={this.handleClick}
            data-action="close"
            className={[styles.icon, styles.close].join(' ')}
          >
            <img src={closeImg} />
          </div>
        </div>
      </header>
    );
  }
}
