"use client";
import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import classes from "./index.module.css";
import { useState } from "react";

export default function AuthenticationImage() {
  const [authMode, toggleAuthMode] = useState("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          {authMode}
        </Title>

        <TextInput
          label="Email Address"
          placeholder="hello@gmail.com"
          size="md"
          radius="md"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
          radius="md"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />
        {authMode === "Register" && (
          <PasswordInput
            label="Confirm-Password"
            placeholder="Your password"
            mt="md"
            size="md"
            radius="md"
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            required
          />
        )}
        <Checkbox label="Keep me logged in" mt="xl" size="md" />
        <Button fullWidth mt="xl" size="md" radius="md">
          {authMode}
        </Button>

        <Text ta="center" mt="md">
          {authMode === "Login"
            ? `Don't have an account? `
            : `Already a User? `}
          <Anchor
            fw={500}
            onClick={() =>
              toggleAuthMode((prev) =>
                prev === "Login" ? "Register" : "Login"
              )
            }
          >
            {authMode === "Login" ? "Register" : "Login"}
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
