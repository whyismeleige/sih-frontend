import { Sun, Moon } from "lucide-react";
import {
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import cx from "clsx";
import classes from "./ThemeChanger.module.css";

export function ChangeTheme() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="default"
      size="xl"
      aria-label="Toggle color scheme"
    >
      <Sun className={cx(classes.icon, classes.light)} />
      <Moon className={cx(classes.icon, classes.dark)} />
    </ActionIcon>
  );
}
