# Components: Algolia

## Overview

This directory contains a custom components for integrating Algolia's search functionality into our application. The components here are tailored to meet our specific requirements, ensuring a seamless user experience.

## Creation Process

The `components/Algolia/` directory was created to address our need for a custom search implementation using Algolia Docsearch. Here’s a brief overview of how this directory was developed:

1. **Source Files**: We sourced most of the files from [Algolia's DocSearch repository](https://github.com/algolia/docsearch/tree/main/packages/docsearch-react/src). These files served as a foundation for our custom implementation.

2. **Customization**: 
   - The components were modified to fit our needs. This included changing specific functionalities and adapting styles to match our application's design.
   - Notably, we created a custom `<Hit>` component to tailor the display of search results.

3. **Removal of Unused Code**: We eliminated unnecessary parts of the original codebase that were not required and were incompatible with our implementation.

4. **Challenges**: 
   - During the customization, we encountered issues with types that were not exported, requiring additional modifications to the components to ensure compatibility.
