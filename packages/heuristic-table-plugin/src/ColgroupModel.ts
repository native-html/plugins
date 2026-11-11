import {
  defaultHTMLElementModels,
  HTMLContentModel,
  HTMLElementModel
} from '@native-html/render';

/**
 * Element model required for colgroup children to be available to the table
 * layout engine. Col elements remain non-rendering empty nodes.
 *
 * @public
 */
const colgroupModel: HTMLElementModel<
  'colgroup',
  HTMLContentModel.block
> = defaultHTMLElementModels.colgroup.extend({
  contentModel: HTMLContentModel.block
});

export default colgroupModel;
