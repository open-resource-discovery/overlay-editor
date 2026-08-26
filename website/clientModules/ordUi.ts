// Client module: load the ui-components design-system stylesheet globally so the
// `.ord-ui`-scoped chrome (Button, Card, Input, SplitPane, SimpleSheet) is themed
// on every page. Importing a component does not pull its CSS (the package marks
// only `*.css` as side-effectful), so we import the stylesheet explicitly here.
import '@open-resource-discovery/ui-components/styles';
