import {
  ConfirmationDialog,
  Dialog,
  EnumFlexDirection,
  EnumFlexItemMargin,
  EnumGapSize,
  FlexItem,
} from "@amplication/ui/design-system";
import { isEmpty } from "lodash";
import React, { useCallback, useState } from "react";
import * as models from "../../models";
import { Resource } from "../../models";
import ExistingConnectionsMenu from "./GitActions/ExistingConnectionsMenu";
import { GitProviderConnectionList } from "./GitActions/GitProviderConnectionList";
import RepositoryActions from "./GitActions/RepositoryActions/RepositoryActions";
import RepositoryForm from "./GitActions/RepositoryActions/RepositoryForm";
import WizardRepositoryActions from "./GitActions/RepositoryActions/RepositoryActionsWizard";
import GitDialogsContainer from "./dialogs/GitDialogsContainer";
import {
  GitRepositoryCreatedData,
  GitRepositorySelected,
} from "./dialogs/GitRepos/GithubRepos";
import useResourceGitSettings from "./useResourceGitSettings";

interface Props {
  type: "wizard" | "resource";
  resource?: Resource;
  gitRepositoryDisconnectedCb?: () => void;
  gitRepositoryCreatedCb?: (data: GitRepositoryCreatedData) => void;
  gitRepositorySelectedCb: (data: GitRepositorySelected) => void;
  gitRepositorySelected?: GitRepositorySelected;
}

const ResourceGitSettings: React.FC<Props> = ({
  type,
  resource,
  gitRepositoryDisconnectedCb,
  gitRepositoryCreatedCb,
  gitRepositorySelectedCb,
  gitRepositorySelected,
}) => {
  const {
    gitOrganizations,
    gitOrganization,
    gitRepositorySelectedData,
    isSelectOrganizationDialogOpen,
    createNewRepoOpen,
    selectRepoOpen,
    popupFailed,
    setPopupFailed,
    connectGitRepoLoading,
    connectGitRepoError,
    handleRepoSelected,
    handleRepoCreated,
    handleOrganizationChange,
    handleRepoDisconnected,
    openSelectOrganizationDialog,
    closeSelectOrganizationDialog,
    openSelectRepoDialog,
    closeSelectRepoDialog,
    openCreateNewRepo,
    closeCreateNewRepo,
    updateGitRepository,
    handleGitOrganizationConnected,
  } = useResourceGitSettings({
    resource,
    gitRepositorySelected,
    gitRepositoryDisconnectedCb,
    gitRepositoryCreatedCb,
    gitRepositorySelectedCb,
  });

  const handleUpdateGitRepositorySubmit = useCallback(
    (data: models.GitRepositoryUpdateInput) => {
      updateGitRepository(resource?.gitRepository.id, data);
    },
    [updateGitRepository]
  );

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleError = useCallback((errorMessage: string) => {
    setErrorMessage(errorMessage);
    setError(true);
  }, []);

  return (
    <>
      <ConfirmationDialog
        isOpen={error}
        onDismiss={() => {
          setError(false);
        }}
        message={errorMessage}
        confirmButton={{
          label: "OK",
        }}
        onConfirm={() => {
          setError(false);
        }}
      ></ConfirmationDialog>

      {gitOrganization && (
        <GitDialogsContainer
          gitOrganization={gitOrganization}
          isSelectRepositoryOpen={selectRepoOpen}
          isPopupFailed={popupFailed}
          gitCreateRepoOpen={createNewRepoOpen}
          gitProvider={gitOrganization.provider}
          src={type === "wizard" ? "serviceWizard" : "githubPage"}
          onSelectGitRepository={(data: GitRepositorySelected) => {
            handleRepoSelected(data);
          }}
          onSelectGitRepositoryDialogClose={() => {
            closeSelectRepoDialog();
          }}
          onPopupFailedClose={() => {
            setPopupFailed(false);
          }}
          onGitCreateRepository={handleRepoCreated}
          onGitCreateRepositoryClose={closeCreateNewRepo}
          repoCreated={{
            isRepoCreateLoading: connectGitRepoLoading,
            RepoCreatedError: connectGitRepoError,
          }}
          openCreateNewRepo={openCreateNewRepo}
          closeSelectRepoDialog={closeSelectRepoDialog}
        />
      )}
      {isSelectOrganizationDialogOpen && (
        <Dialog
          title="Select Git Provider"
          className="git-organization-dialog"
          isOpen={isSelectOrganizationDialogOpen}
          onDismiss={closeSelectOrganizationDialog}
        >
          <GitProviderConnectionList
            onDone={handleGitOrganizationConnected}
            setPopupFailed={setPopupFailed}
            onProviderSelect={closeSelectOrganizationDialog}
            onSelectRepository={openSelectRepoDialog}
            onError={handleError}
          />
        </Dialog>
      )}
      {isEmpty(gitOrganizations) ? (
        <GitProviderConnectionList
          onDone={handleGitOrganizationConnected}
          setPopupFailed={setPopupFailed}
          onSelectRepository={openSelectRepoDialog}
          onError={handleError}
        />
      ) : (
        <>
          {!resource?.gitRepository &&
            !gitRepositorySelectedData?.repositoryName && (
              <FlexItem
                direction={EnumFlexDirection.Column}
                margin={EnumFlexItemMargin.Bottom}
                gap={EnumGapSize.Small}
              >
                <div>
                  <ExistingConnectionsMenu
                    gitOrganizations={gitOrganizations}
                    onSelectGitOrganization={handleOrganizationChange}
                    selectedGitOrganization={gitOrganization}
                    onAddGitOrganization={openSelectOrganizationDialog}
                  />
                </div>
              </FlexItem>
            )}
          {type === "wizard" ? (
            <WizardRepositoryActions
              onCreateRepository={openCreateNewRepo}
              onSelectRepository={openSelectRepoDialog}
              onDisconnectGitRepository={handleRepoDisconnected}
              selectedGitOrganization={gitOrganization}
              selectedGitRepository={gitRepositorySelectedData}
            />
          ) : (
            <>
              <RepositoryActions
                onCreateRepository={openCreateNewRepo}
                onSelectRepository={openSelectRepoDialog}
                currentResourceWithGitRepository={resource}
                selectedGitOrganization={gitOrganization}
              />
              {resource?.gitRepository && (
                <>
                  <RepositoryForm
                    defaultValues={resource?.gitRepository}
                    onSubmit={handleUpdateGitRepositorySubmit}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default ResourceGitSettings;
