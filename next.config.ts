import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/vault", destination: "/lab", permanent: true },
      {
        source: "/vault/floor-worth-raising",
        destination: "/lab/floor-worth-raising",
        permanent: true,
      },
      {
        source: "/vault/taste-is-the-thing",
        destination: "/lab/taste-is-the-thing",
        permanent: true,
      },
      {
        source: "/vault/train-on-taste",
        destination: "/lab/train-on-taste",
        permanent: true,
      },
      {
        source: "/vault/intro-programming",
        destination: "/lab",
        permanent: true,
      },
      {
        source: "/vault/robotics",
        destination: "/lab",
        permanent: true,
      },
      {
        source: "/lab/intro-programming",
        destination: "/lab",
        permanent: true,
      },
      {
        source: "/lab/robotics",
        destination: "/lab",
        permanent: true,
      },
      { source: "/writeups", destination: "/writing", permanent: true },
    ];
  },
};

export default nextConfig;
