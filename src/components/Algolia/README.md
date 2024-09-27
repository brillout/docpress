# Components: Algolia

## Overview

This directory contains a custom components for integrating Algolia's search functionality into our application. The components here are tailored to meet our specific requirements, ensuring a seamless user experience.

## Creation Process

The `components/Algolia/` directory was created to address our need for a custom search implementation using Algolia Docsearch. Here’s a brief overview of how this directory was created:

1. **Source Files**: 
  We sourced most of the files from [Algolia's DocSearch repository](https://github.com/algolia/docsearch/tree/9733ba9a503e18a27d5fef3470fde8b3bb54ec79/packages/docsearch-react/src), specifically extracting the base for our `<Hit>` component from their [Results.tsx](https://github.com/algolia/docsearch/blob/9733ba9a503e18a27d5fef3470fde8b3bb54ec79/packages/docsearch-react/src/Results.tsx#L113-L169) file, which includes the core rendering logic and styles.

1. **Customization**: 
   - The components were modified to fit our needs. This included changing specific functionalities and adapting styles to match our application's design.
   - Most notably, we created a custom `<Hit>` component to tailor the display of search results.

2. **Removal of Unused Code**: We eliminated unnecessary parts of the original codebase that were not required and were incompatible with our implementation.

3. **Minor adaptation**:
   - While copying the original source code, we encountered issues with types that were not exported, requiring additional modifications to the components to ensure compatibility.
