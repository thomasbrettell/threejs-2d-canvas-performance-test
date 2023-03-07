import React, { useEffect } from 'react';
import styles from './styles.scss';

const ErrorBox = ({ error }) => {
  useEffect(() => console.log(error), []);

  return <pre className={styles.root}>{`${String(error)}\n\n${error.stack}`}</pre>;
};

export default ErrorBox;
