import React, { useState } from 'react';
import { ContractFunctionParameters } from '@hashgraph/sdk';

// Define the structure of your parameter object using plain JavaScript
const ContractFunctionParameterBuilder = () => {
  const [params, setParams] = useState([]);

  // Add a parameter to the list
  const addParam = (param) => {
    setParams([...params, param]);
  };

  // Purpose: Build the ABI function parameters
  const buildAbiFunctionParams = () => {
    return params.map(param => `${param.type} ${param.name}`).join(', ');
  };

  // Purpose: Build the ethers compatible contract function call params
  const buildEthersParams = () => {
    return params.map(param => param.value.toString());
  };

  // Purpose: Build the HAPI compatible contract function params
  const buildHAPIParams = () => {
    const contractFunctionParams = new ContractFunctionParameters();
    for (const param of params) {
      // Ensure type only contains alphanumeric characters (no spaces, special characters, or whitespace)
      const alphanumericIdentifier = /^[a-zA-Z][a-zA-Z0-9]*$/;
      if (!param.type.match(alphanumericIdentifier)) {
        throw new Error(`Invalid type: ${param.type}. Type must only contain alphanumeric characters.`);
      }
      // Capitalize the first letter of the type
      const type = param.type.charAt(0).toUpperCase() + param.type.slice(1);
      const functionName = `add${type}`;
      if (typeof contractFunctionParams[functionName] === 'function') {
        contractFunctionParams[functionName](param.value);
      } else {
        throw new Error(`Invalid type: ${param.type}. Could not find function ${functionName} in ContractFunctionParameters class.`);
      }
    }

    return contractFunctionParams;
  };

  return {
    addParam,
    buildAbiFunctionParams,
    buildEthersParams,
    buildHAPIParams
  };
};

export default ContractFunctionParameterBuilder;
