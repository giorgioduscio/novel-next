"use client";

import React from "react";
import { AgreeProvider } from "@/app/shareds/Agree";
import { BookProvider } from "@/app/data/BookContext";
import { CommonPagesProvider } from "@/app/data/CommonPagesContext";
import { AuthProvider } from "@/app/data/AuthContext";

const providers = [
  AgreeProvider,
  CommonPagesProvider,
  BookProvider,
  AuthProvider,
];

export function AppProviders({ children }: { children: React.ReactNode }) {
  return providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );
}
