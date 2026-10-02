import { type FC, type ReactNode } from "react";

type ProviderComponent = FC<{ children: ReactNode }>;

export const composeProviders = (
  ...providers: ProviderComponent[]
): ProviderComponent =>
  providers.reduce<ProviderComponent>(
    (Prev, Provider) =>
      ({ children }) =>
      (
        <Prev>
          <Provider>{children}</Provider>
        </Prev>
      ),
    ({ children }) => <>{children}</>
  );
