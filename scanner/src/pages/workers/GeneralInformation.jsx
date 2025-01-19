import { Stack, Typography } from "@mui/material";
import moment from "moment";

function GeneralInformation({ verifier}) {
  return (
    <>
      <Stack rowGap={2} py={2}>
        <ProfileItem label="Name" value={verifier?.data?.name} />
        <ProfileItem label="Username" value={verifier?.data?.username} />
        <ProfileItem
          label="Date of Birth"
          value={moment(new Date(verifier?.data?.dob)).format("Do MMMM,YYYY")}
        />
        <ProfileItem label="Role" value={verifier?.data?.role} />
        <ProfileItem label="Nation ID" value={verifier?.data?.nid} />
        <ProfileItem label="Email Address" value={verifier?.data?.email} />
        <ProfileItem
          label="Telephone Number"
          value={verifier?.data?.phonenumber}
        />
        <ProfileItem
          label="Residential Address"
          value={verifier?.data?.residence}
        />
      </Stack>
    </>
  );
}

const ProfileItem = ({ label, value }) => {
  return (
    <Stack direction="row" spacing={3} gap={4}>
      <Typography
        variant="body2"
        fontWeight="bold"
        flexWrap="nowrap"
        // color='secondary'
        width={160}
      >
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
};

export default GeneralInformation;
