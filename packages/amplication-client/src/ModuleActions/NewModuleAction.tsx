import { Snackbar } from "@amplication/ui/design-system";
import { pascalCase } from "pascal-case";
import { useCallback, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, EnumButtonStyle } from "../Components/Button";
import NewModuleChild from "../Modules/NewModuleChild";
import { useModulesContext } from "../Modules/modulesContext";
import { AppContext } from "../context/appContext";
import { REACT_APP_FEATURE_CUSTOM_ACTIONS_ENABLED } from "../env";
import * as models from "../models";
import { formatError } from "../util/error";
import useModuleAction from "./hooks/useModuleAction";
import { useOnboardingChecklistContext } from "../OnboardingChecklist/context/OnboardingChecklistContext";

type Props = {
  resourceId: string;
  moduleId: string;
  onActionCreated?: (moduleAction: models.ModuleAction) => void;
  buttonStyle?: EnumButtonStyle;
};

const NewModuleAction = ({
  resourceId,
  moduleId,
  onActionCreated,
  buttonStyle = EnumButtonStyle.Primary,
}: Props) => {
  const history = useHistory();
  const { currentWorkspace, currentProject } = useContext(AppContext);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { customActionsLicenseEnabled } = useModulesContext();
  const { setOnboardingProps } = useOnboardingChecklistContext();

  const {
    createModuleAction,
    createModuleActionError: error,
    createModuleActionLoading: loading,
  } = useModuleAction();

  const handleDialogStateChange = useCallback(() => {
    setDialogOpen(!dialogOpen);
  }, [dialogOpen, setDialogOpen]);

  const handleSubmit = useCallback(
    (data, moduleId: string) => {
      const displayName = data.displayName.trim();
      const name = pascalCase(displayName);

      createModuleAction({
        variables: {
          data: {
            displayName,
            name,
            resource: { connect: { id: resourceId } },
            parentBlock: { connect: { id: moduleId } },
          },
        },
      })
        .catch(console.error)
        .then((result) => {
          if (result && result.data) {
            if (onActionCreated) {
              onActionCreated(result.data.createModuleAction);
            }
            history.push(
              `/${currentWorkspace?.id}/${currentProject?.id}/${resourceId}/modules/${moduleId}/actions/${result.data.createModuleAction.id}`
            );
            setOnboardingProps({
              apiUpdated: true,
            });
          }
        });
      setDialogOpen(false);
    },
    [
      createModuleAction,
      resourceId,
      onActionCreated,
      history,
      currentWorkspace?.id,
      currentProject?.id,
      setOnboardingProps,
    ]
  );

  const errorMessage = formatError(error);

  return (
    <div>
      {dialogOpen && (
        <NewModuleChild
          resourceId={resourceId}
          moduleId={moduleId}
          loading={loading}
          errorMessage={errorMessage}
          typeName={"Action"}
          description={
            <>
              Give your new Action a descriptive name. <br />
              For example: Create Customer, Update Order
            </>
          }
          onCreate={handleSubmit}
          onDismiss={handleDialogStateChange}
        />
      )}
      {REACT_APP_FEATURE_CUSTOM_ACTIONS_ENABLED === "true" && (
        <Button
          buttonStyle={buttonStyle}
          onClick={handleDialogStateChange}
          disabled={!customActionsLicenseEnabled}
          icon="api"
        >
          Add Action
        </Button>
      )}

      <Snackbar open={Boolean(error)} message={errorMessage} />
    </div>
  );
};

export default NewModuleAction;
