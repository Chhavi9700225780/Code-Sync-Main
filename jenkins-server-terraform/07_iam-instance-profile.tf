resource "aws_iam_instance_profile" "instance-profile" {
  name = "jenkins-server-instance-profile"
  role = aws_iam_role.iam-role.name
}