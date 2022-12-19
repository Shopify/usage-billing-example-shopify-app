import { useState } from "react";
import { Card, Link } from "@shopify/polaris";
import { Toast, useNavigate } from "@shopify/app-bridge-react";

import { useAuthenticatedFetch } from "../hooks";

export function PaidFeature() {
  const [isLoading, setIsLoading] = useState(false);
  const [toastProps, setToastProps] = useState({ content: null });
  const [capacityReached, setCapacityReached] = useState(false);
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  /*
   * This will use the authenticated fetch hook to make a request to our server
   * to create a usage record. If the usage record is created successfully, we
   * will set the toastProps to display a success message. If the usage record
   * is not created successfully, we will set the toastProps to display an error
   * If the usage record is not created successfully because the capacity has
   * been reached, we will set the capacityReached state to true so that the
   * button is disabled.
   */
  const handleCreateUsageRecord = async () => {
    setIsLoading(true);
    const response = await fetch("/api/usage/create");
    const body = await response.json();
    body.capacityReach ? setCapacityReached(true) : setCapacityReached(false);
    setIsLoading(false);

    if (response.ok) {
      setToastProps({ content: "Usage record created!" });
    } else {
      setToastProps({
        content: "There was an error creating usage record",
        error: true,
      });
    }
  };

  /* 
  * This uses AppBridge to open the  app subscription management page 
  * in the Shopify Admin.
  */
  const handleNavigateToSubscriptionPage = () => {
    navigate("/settings/billing/subscriptions", {
      replace: true,
      target: "host",
    });
  };

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps({ content: null })} />
  );

  return (
    <>
      {toastMarkup}
      <Card
        title="Usage Billing"
        sectioned
        primaryFooterAction={{
          content: "Create Usage Record",
          onAction: handleCreateUsageRecord,
          loading: isLoading,
          disabled: capacityReached,
        }}
      >
        {capacityReached ? (
          <Link onClick={handleNavigateToSubscriptionPage}>
            To continue using this feature please update maximum usage charge
            limits
          </Link>
        ) : (
          <p>Use this feature! (Will be charged for usage)</p>
        )}
      </Card>
    </>
  );
}