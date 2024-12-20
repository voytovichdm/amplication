import { memo, type FC } from "react";
import { type NodeProps } from "reactflow";
import "./modelNode.scss";

import * as models from "../../../models";
import { NodePayload } from "../types";
import ModelNodeBase from "./modelNodeBase";

type ModelProps = Omit<NodeProps, "data"> & {
  data: NodePayload<models.Entity>;
};
const CLASS_NAME = "model-node";

const ModelNode: FC<ModelProps> = memo(({ id }) => {
  return <ModelNodeBase modelId={id} className={`${CLASS_NAME}--simple`} />;
});
ModelNode.displayName = "ModelNode";

export default ModelNode;
